
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(console.error);
  });
}



(function(){
  'use strict';
  // Safe storage fallback
  const storage = (()=>{
    try { const t='ot_test_'+Date.now(); localStorage.setItem(t,'1'); localStorage.removeItem(t); return localStorage; }
    catch(e){ const mem={}; return {getItem:k=>mem[k]||null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}}; }
  })();

  const DESTINATION_MILES = 900;
  const START = { food:0, money:300, miles:0, day:1 }; // baseline $300
  const MAX_PARTY = 6;
  const PROFESSIONS = ["None","Banker","Carpenter","Farmer","Hunter","Doctor"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];

  // Rivers
  const RIVERS = [
    { name: 'Kansas River', mile: 102, width: 630, depth: 2.5, ferry: 5 },
    { name: 'Big Blue River', mile: 185, width: 200, depth: 3.5, ferry: 3 },
    { name: 'Green River', mile: 600, width: 400, depth: 4.5, ferry: 8 },
    { name: 'Snake River', mile: 800, width: 1000, depth: 6.0, ferry: 12 }
  ];
  // Forts & mountains (approximate mileposts on our 0..900 scale)
  const LANDMARKS = [
    { type:'fort', name:'Fort Kearny', mile:240 },
    { type:'mtn',  name:'Chimney Rock', mile:300 },
    { type:'fort', name:'Fort Laramie', mile:420 },
    { type:'mtn',  name:'Independence Rock', mile:520 },
    { type:'mtn',  name:'South Pass', mile:650 },
    { type:'fort', name:'Fort Hall', mile:730 },
    { type:'mtn',  name:'Blue Mountains', mile:820 },
    { type:'fort', name:'The Dalles', mile:880 }
  ];

  let crossed = RIVERS.map(()=>false);
  let currentRiver = -1;

  // Date state
  let curMonthIdx = 3; // April
  let curDayOfMonth = 1;

  // Profession bonuses
  function computeBonuses(party){
    const counts = { Banker:0, Carpenter:0, Farmer:0, Hunter:0, Doctor:0 };
    party.forEach(m=>{ if (m.alive && counts.hasOwnProperty(m.prof)) counts[m.prof]++; });
    return {
      bankerMoneyBonus: 50 * counts.Banker,
      forageMultiplier: 1 + 0.30 * counts.Farmer,
      huntMultiplier: 1 + 0.30 * counts.Hunter,
      restHealBonus: 2 * counts.Doctor,
      breakdownLossFactor: Math.max(0.2, Math.pow(0.5, counts.Carpenter)) // min 20%
    };
  }

  function loadPartyV3(){
    const raw = storage.getItem('trail.party.v3');
    if (raw) { try { return JSON.parse(raw); } catch(e){} }
    let names = ["Alex","Bailey","Casey","Dakota"];
    const rawV2 = storage.getItem('trail.party.v2');
    if (rawV2) { try { const v2 = JSON.parse(rawV2); names = v2.map(p=>p.name); } catch(e){} }
    const rawV1 = storage.getItem('trail.party');
    if (rawV1 && !rawV2) { try { names = JSON.parse(rawV1); } catch(e){} }
    return names.slice(0,4).map(n=>({ name:n, prof:"None", health:100, alive:true }));
  }

  let party = loadPartyV3();
  let graves = []; // {name, day, reason, prof}

  // Core state
  let food = START.food, money = START.money, miles = START.miles, day = START.day;
  let pace = 'steady', rations = 'normal';
  let oxenTeams = 0, clothingSets = 0, ammo = 0, spareParts = 0;
  let shortcutsEnabled = true;
  let modalOpen = false;

  function startingBudget(){ return START.money + computeBonuses(party).bankerMoneyBonus; }

  // DOM refs
  const el = id => document.getElementById(id);
  const elDay = el('day'), elFood = el('food'), elHealthAvg = el('healthAvg');
  const elMilesLabel = el('milesLabel'), elProgress = el('progress'), elWagon = el('wagon'), track = el('track');
  const elPaceVal = el('paceVal'), elRationsVal = el('rationsVal');
  const selPace = el('pace'), selRations = el('rations'), selStartMonth = el('startMonth');
  const logBox = el('log'), partyList = el('partyList'), gravesBox = el('graves');
  const elMoney = el('money'), elOxen = el('oxen'), elClothing = el('clothing'), elAmmo = el('ammo'), elParts = el('parts');
  const chkShortcuts = el('toggleShortcuts');
  const elDateLabel = el('dateLabel');

  // Overlays
  const shop = el('shop'), river = el('river'), victory = el('victory'), defeat = el('defeat');
  const riverInfo = el('riverInfo'); const rvFord = el('rvFord'), rvFloat = el('rvFloat'), rvFerry = el('rvFerry'), rvWait = el('rvWait');
  const vicStats = el('vicStats'), vicReset = el('vicReset'); const defReset = el('defReset'); const confetti = el('confetti');

  // Shop refs
  const siOxen = el('siOxen'), siFood = el('siFood'), siClothing = el('siClothing'), siAmmoBoxes = el('siAmmoBoxes'), siParts = el('siParts');
  const shopBudget = el('shopBudget'), shopRemaining = el('shopRemaining');
  const btnBegin = el('shopBegin'), btnCancel = el('shopCancel');

  // Utils
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const rand = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pickIdx = (arr, pred=(x)=>x)=>{
    const idxs = arr.map((v,i)=>({v,i})).filter(o=>pred(o.v)).map(o=>o.i);
    return idxs.length? idxs[rand(0,idxs.length-1)] : -1;
  };
  const liveMembers = ()=>party.filter(p=>p.alive);
  const everyoneDead = ()=>liveMembers().length === 0;
  const avgHealth = ()=>{
    const live = liveMembers();
    if (!live.length) return 0;
    return Math.round(live.reduce((s,p)=>s+p.health,0) / live.length);
  };
  const isTypingTarget = (t)=> t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

  function fmtDate(){ return MONTHS[curMonthIdx] + ' ' + curDayOfMonth; }

  function pushLog(txt){
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = '<span>⚑</span><span>'+ time +' — '+ txt +'</span>';
    logBox.prepend(div);
    while (logBox.children.length > 200) logBox.removeChild(logBox.lastChild);
  }

  function saveParty(){ storage.setItem('trail.party.v3', JSON.stringify(party)); }

  function killMember(member, reason){
    if (!member.alive) return;
    member.alive = false; member.health = 0;
    graves.push({ name: member.name, day, reason, prof: member.prof });
    pushLog('💀 ' + member.name + ' ('+member.prof+') has died — ' + reason + '.');
    saveParty();
  }

  function renderParty(){
    partyList.innerHTML = '';
    party.forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'party-row mt8';
      const healthPct = clamp(m.health,0,100);
      const dead = !m.alive;
      const profOptions = PROFESSIONS.map(p=>`<option ${m.prof===p?'selected':''}>${p}</option>`).join('');
      row.innerHTML =
        `<input type="text" value="${m.name.replace(/"/g,'&quot;')}" ${dead?'disabled':''} style="max-width:260px;">` +
        `<select ${dead?'disabled':''} title="Profession">${profOptions}</select>` +
        `<div class="healthbar" title="Health: ${healthPct}%"><div class="healthfill ${healthPct<=30?'low':''}" style="width:${healthPct}%"></div></div>` +
        `<div style="display:flex; gap:6px; align-items:center;">` +
          (dead? '<span title="Deceased">💀</span>' : '') +
          `<button class="btn outline" title="Remove">🗑️</button>` +
        `</div>`;
      const input = row.querySelector('input');
      const select = row.querySelector('select');
      const btnDel = row.querySelector('button');
      input && input.addEventListener('input', ()=>{ m.name = input.value; saveParty(); });
      select && select.addEventListener('change', ()=>{ m.prof = select.value; saveParty(); });
      btnDel.addEventListener('click', ()=>{ party.splice(i,1); saveParty(); uiUpdate(); });
      partyList.appendChild(row);
    });
    el('btnAdd').disabled = party.length >= MAX_PARTY;
  }

  function renderGraves(){
    gravesBox.innerHTML = '';
    graves.forEach(g=>{
      const row = document.createElement('div');
      row.className = 'grave mt8';
      row.innerHTML = `<span class="rip">💀 ${g.name} (${g.prof})</span><span>Day ${g.day} — ${g.reason}</span>`;
      gravesBox.appendChild(row);
    });
  }

  function renderMarkers(){
    track.querySelectorAll('.marker').forEach(m=>m.remove());
    const trackWidth = track.clientWidth - 12;
    function addMarker(x, name, cls, done){
      const mk = document.createElement('div');
      mk.className = `marker ${cls} ${done?'mk-done':''}`;
      mk.style.left = x + 'px';
      mk.innerHTML = `<div class="pin"></div><div class="lbl">${name}</div>`;
      track.appendChild(mk);
    }
    // Rivers
    RIVERS.forEach((r,i)=>{
      const x = Math.max(10, Math.min(trackWidth-10, (r.mile/DESTINATION_MILES) * trackWidth));
      addMarker(x, r.name, 'mk-river', crossed[i]);
    });
    // Landmarks
    LANDMARKS.forEach(l=>{
      const x = Math.max(10, Math.min(trackWidth-10, (l.mile/DESTINATION_MILES) * trackWidth));
      addMarker(x, l.name, l.type==='fort'?'mk-fort':'mk-mtn', miles >= l.mile);
    });
  }

  function uiUpdate(){
    elDay.textContent = day;
    elDateLabel.textContent = fmtDate();
    elFood.textContent = food;
    elHealthAvg.textContent = avgHealth();
    elMilesLabel.textContent = miles + ' / ' + DESTINATION_MILES + ' miles';
    elProgress.style.width = (miles/DESTINATION_MILES*100)+'%';
    elPaceVal.textContent = pace;
    elRationsVal.textContent = rations;
    elMoney.textContent = '$' + money.toFixed(2);
    elOxen.textContent = oxenTeams;
    elClothing.textContent = clothingSets;
    elAmmo.textContent = ammo;
    elParts.textContent = spareParts;
    const trackWidth = elWagon.parentElement.clientWidth - 100;
    elWagon.style.left = Math.min(trackWidth, Math.max(0, (miles/DESTINATION_MILES) * trackWidth)) + 'px';
    renderParty(); renderGraves(); renderMarkers();
  }

  function baseFoodUse(){ return {meager:3, normal:5, full:7}[rations] * liveMembers().length; }
  function baseMiles(){
    const paceMiles = {slow:12, steady:18, grueling:24}[pace];
    const oxenMult = 1 + 0.15 * Math.max(0, oxenTeams-1);
    return Math.round(paceMiles * oxenMult);
  }
  function baseHealthDelta(){
    const r = ({meager:-2, normal:0, full:+1}[rations]);
    const p = ({slow:+1, steady:0, grueling:-2}[pace]);
    const missingClothes = Math.max(0, liveMembers().length - clothingSets);
    const clothingPenalty = missingClothes>0 ? -1 : 0;
    return r + p + clothingPenalty;
  }

  function applyGroupHealth(delta){
    liveMembers().forEach(p=>{
      p.health = clamp(p.health + delta, 0, 100);
      if (p.health <= 0) killMember(p, 'succumbed to hardship');
    });
  }

  // Date helpers
  function advanceDays(n){
    for (let i=0;i<n;i++){
      day += 1;
      curDayOfMonth += 1;
      if (curDayOfMonth > MONTH_DAYS[curMonthIdx]){
        curDayOfMonth = 1;
        curMonthIdx = (curMonthIdx + 1) % 12;
      }
    }
  }

  function seasonWeatherChance(){
    // base chance by month (approx — later months worse)
    const table = [0.10,0.10,0.12,0.12,0.14,0.12,0.10,0.12,0.18,0.26,0.34,0.40];
    return table[curMonthIdx] || 0.12;
  }

  function pickWeatherEvent(){
    // choose heat/cold/storm with seasonal tilt
    let t = Math.random();
    if (curMonthIdx <= 3) { // Jan-Apr: more cold
      if (t < 0.55) return 'cold';
      if (t < 0.8) return 'storm';
      return 'heat';
    } else if (curMonthIdx <= 7) { // May-Aug: more heat/storm
      if (t < 0.5) return 'heat';
      if (t < 0.85) return 'storm';
      return 'cold';
    } else { // Sep-Dec: more cold/storm
      if (t < 0.55) return 'cold';
      if (t < 0.9) return 'storm';
      return 'heat';
    }
  }

  // Event engine
  function weatherEvent(){
    const type = pickWeatherEvent();
    if (type === 'heat'){
      const dmg = rand(2,5) + (rations==='meager'?1:0);
      applyGroupHealth(-dmg);
      pushLog('A heat wave saps everyone\'s strength.');
      return { food:-rand(4,10), miles:-rand(0,6), money:0, type:'heat' };
    }
    if (type === 'cold'){
      const underdressed = Math.max(0, liveMembers().length - clothingSets)>0;
      const dmg = rand(2,6) + (underdressed?2:0);
      applyGroupHealth(-dmg);
      pushLog('A cold snap chills the camp.' + (underdressed?' Some are underdressed.':''));
      return { food:-rand(4,10), miles:-rand(0,6), money:0, type:'cold' };
    }
    // storm
    const dmg = rand(2,6) + (Math.max(0, liveMembers().length - clothingSets)>0 ? 1 : 0);
    applyGroupHealth(-dmg);
    pushLog('A storm slows your progress.');
    return { food:-rand(5,12), miles:-rand(5,20), money:0, type:'storm' };
  }

  function nonWeatherEvent(context){
    const idx = pickIdx(party, p=>p.alive);
    const who = idx>=0 ? party[idx] : null;
    const r = Math.random();
    // context-weighted ordering
    if (r < 0.16) { // rattlesnake encounter (distinct)
      if (who){
        const dmg = rand(10,22);
        who.health = clamp(who.health - dmg, 0, 100);
        pushLog(`${who.name} (${who.prof}) is struck by a rattlesnake (-${dmg} health).`);
        if (who.health<=0) killMember(who, 'rattlesnake bite');
      }
      return { food:0, miles:-rand(2,8), money:0, type:'rattlesnake' };
    }
    if (r < 0.28 && context!=='rest') { // wagon stuck
      const baseLoss = rand(8,20);
      const milesLoss = Math.round(baseLoss * 0.9);
      pushLog('The wagon gets stuck in the mud; you dig it out.');
      return { food:-rand(2,6), miles:-milesLoss, money:0, type:'stuck' };
    }
    if (r < 0.40) { // breakdown
      const dmg = rand(1,4);
      applyGroupHealth(-dmg);
      if (spareParts > 0) {
        spareParts--; pushLog('A wagon wheel breaks, but a spare part fixes it quickly.');
        return { food:-rand(2,5), miles:0, money:0, type:'breakdown' };
      }
      pushLog('A wagon wheel breaks and you make repairs.');
      return { food:-rand(4,10), miles:-rand(10,25), money:-rand(5,15), type:'breakdown' };
    }
    if (r < 0.54) { // find food/water
      const heal = rand(1,4);
      applyGroupHealth(+heal);
      if (who) pushLog(`${who.name} (${who.prof}) finds wild berries and a stream (+${heal} health).`);
      return { food:+rand(8,24), miles:0, money:0, type:'find' };
    }
    if (r < 0.70) { // friendly traders
      const foodGain = rand(12,28);
      const cost = Math.max(1, Math.round(foodGain * 0.1));
      if (money >= cost) { money -= cost; pushLog(`Friendly traders offer supplies. You buy ${foodGain} lb of food for $${cost}.`); return { food:+foodGain, miles:0, money:0, type:'friendly' }; }
      else { pushLog('Friendly traders stop by, but you lack money to trade.'); return { type:'friendly' }; }
    }
    if (r < 0.86) { // raiders
      let lossFood = rand(10,40), lossAmmo = rand(0,15);
      if (ammo >= 5){ const used = 5; ammo -= used; lossFood = Math.max(0, lossFood - rand(8,18));
        pushLog(`Raiders ambush the camp, but you drive them off (used ${used} ammo).`);
      } else {
        pushLog('Raiders steal supplies during the night!');
      }
      return { food:-lossFood, miles:0, money:0, type:'hostile', ammo:-lossAmmo };
    }
    // illness last
    if (who){
      const dmg = rand(6,14);
      who.health = clamp(who.health - dmg, 0, 100);
      pushLog(`${who.name} (${who.prof}) falls ill (-${dmg} health).`);
      if (who.health<=0) killMember(who, 'illness');
    }
    return { type:'illness' };
  }

  function triggerEvent(context, baseProb){
    // First, seasonal weather roll (independent small chance)
    const weatherProb = seasonWeatherChance();
    let happened = false;
    if (Math.random() < weatherProb){
      let evt = weatherEvent();
      evt = applyProfessionEffectsToEvent(evt);
      applyEventDeltas(evt);
      happened = true;
    }
    // Then a general event roll (higher than before)
    if (Math.random() < baseProb){
      let evt = nonWeatherEvent(context);
      evt = applyProfessionEffectsToEvent(evt);
      applyEventDeltas(evt);
      happened = true;
    }
    if (happened) uiUpdate();
  }

  function applyProfessionEffectsToEvent(evt){
    if (!evt) return evt;
    const bonuses = computeBonuses(party);
    const out = { ...evt };
    if (evt.type === 'breakdown' && out.miles < 0){
      out.miles = Math.round(out.miles * bonuses.breakdownLossFactor);
    }
    if (evt.type === 'find' && out.food > 0){
      out.food = Math.round(out.food * bonuses.forageMultiplier);
    }
    return out;
  }

  function applyEventDeltas(evt){
    if (!evt) return;
    if (typeof evt.food === 'number') food = clamp(food + evt.food, 0, 99999);
    if (typeof evt.miles === 'number') miles = clamp(miles + evt.miles, 0, DESTINATION_MILES);
    if (typeof evt.money === 'number') money = clamp(money + evt.money, 0, 99999);
    if (typeof evt.ammo === 'number') ammo = clamp(ammo + evt.ammo, 0, 99999);
    checkEnd();
  }

  // Rivers
  function checkForRiver(prevMiles, newMiles){
    for (let i=0;i<RIVERS.length;i++){
      if (crossed[i]) continue;
      const r = RIVERS[i];
      if (prevMiles < r.mile && newMiles >= r.mile){
        miles = r.mile;
        openRiver(i);
        pushLog(`You reach the ${r.name}.`);
        uiUpdate();
        return true;
      }
    }
    return false;
  }

  function openRiver(i){
    currentRiver = i;
    const r = RIVERS[i];
    riverInfo.textContent = `${r.name} — width ~${r.width} ft, depth ~${r.depth.toFixed(1)} ft. Ferry costs $${r.ferry}.`;
    river.style.display = 'flex'; modalOpen = true;
  }
  function closeRiver(){ river.style.display = 'none'; modalOpen = false; }

  function riverRisk(depth){
    if (depth < 2) return 0.08;
    if (depth < 3.5) return 0.18;
    if (depth < 5) return 0.32;
    return 0.45;
  }
  function riverOutcome(kind){
    const r = RIVERS[currentRiver];
    let chanceFail = 0, timeDays = 1, moneyCost = 0;
    if (kind==='ford'){ chanceFail = riverRisk(r.depth); timeDays = 0; }
    else if (kind==='float'){ chanceFail = Math.max(0.08, riverRisk(r.depth) * 0.5); timeDays = 1; }
    else if (kind==='ferry'){ chanceFail = 0.04; timeDays = 1; moneyCost = r.ferry; }
    else if (kind==='wait'){ r.depth = Math.max(1.5, r.depth - 0.5); advanceDays(1); pushLog('You wait a day for better conditions.'); uiUpdate(); return; }
    if (moneyCost > 0){ if (money < moneyCost){ pushLog('Not enough money for the ferry.'); return; } money -= moneyCost; }
    advanceDays(timeDays);
    if (Math.random() < chanceFail){
      const loseFood = rand(20, 80), loseAmmo = rand(10, 40);
      const oxLoss = (Math.random()<0.25 && oxenTeams>0) ? 1 : 0;
      food = clamp(food - loseFood, 0, 99999);
      ammo = clamp(ammo - loseAmmo, 0, 99999);
      oxenTeams = clamp(oxenTeams - oxLoss, 0, 99);
      applyGroupHealth(-rand(6,16));
      pushLog(`Disaster at the ${r.name}! Lost ${loseFood} lb food, ${loseAmmo} ammo${oxLoss?`, ${oxLoss} oxen team`:''}.`);
    } else {
      pushLog(`You cross the ${r.name} safely by ${kind==='ford'?'fording':kind==='float'?'caulking and floating':'ferry'}.`);
      crossed[currentRiver] = true;
      closeRiver();
    }
    uiUpdate(); checkEnd();
  }

  // End screens
  function openVictory(){
    const survivors = liveMembers().length;
    vicStats.textContent = `Date: ${fmtDate()} · Days: ${day} · Survivors: ${survivors}/${party.length} · Food: ${food} lb · Money: $${money.toFixed(2)}`;
    confetti.innerHTML = Array.from({length:60}).map(()=>'<i style="left:'+Math.random()*100+'%; animation-delay:'+ (Math.random()*1.2).toFixed(2)+'s"></i>').join('');
    victory.style.display = 'flex'; modalOpen = true;
  }
  function closeVictory(){ victory.style.display = 'none'; modalOpen = false; confetti.innerHTML = ''; }
  function openDefeat(){ defeat.style.display = 'flex'; modalOpen = true; }
  function closeDefeat(){ defeat.style.display = 'none'; modalOpen = false; }

  function checkEnd(){
    const reached = miles >= DESTINATION_MILES;
    const allDead = everyoneDead();
    if (reached){ openVictory(); return; }
    if (allDead){ openDefeat(); return; }
  }

  // Actions
  function doTravel(){
    if (modalOpen) return;
    if (oxenTeams <= 0) { pushLog('You have no oxen to pull the wagon.'); return; }
    const prev = miles;
    const todayMiles = clamp(baseMiles() + rand(-4,6), 4, 36);
    const todayFood = -Math.ceil(baseFoodUse()/2);
    const todayHealth = baseHealthDelta() + rand(-1,1);
    miles = clamp(miles + todayMiles, 0, DESTINATION_MILES);
    food = clamp(food + todayFood, 0, 99999);
    applyGroupHealth(todayHealth);
    advanceDays(1);
    pushLog('You travel ' + todayMiles + ' miles.');
    triggerEvent('travel', 0.6); // higher event rate while traveling
    if (!checkForRiver(prev, miles)) { uiUpdate(); checkEnd(); }
  }

  function doRest(){
    if (modalOpen) return;
    const baseHeal = rand(6,12);
    const heal = baseHeal + computeBonuses(party).restHealBonus;
    liveMembers().forEach(p=>{ p.health = clamp(p.health + heal, 0, 100); });
    food = clamp(food - Math.max(0, liveMembers().length - 1), 0, 99999);
    advanceDays(1);
    pushLog('You rest and recover ~' + heal + ' health per traveler.');
    triggerEvent('rest', 0.3);
    uiUpdate(); checkEnd();
  }

  function doHunt(){
    if (modalOpen) return;
    if (ammo <= 0){ pushLog('No ammunition left to hunt.'); return; }
    const bullets = Math.min(5, ammo);
    ammo -= bullets;
    const mult = computeBonuses(party).huntMultiplier;
    const baseGain = rand(12,34);
    const gain = Math.round(baseGain * mult * (bullets/5));
    food = clamp(food + gain - 2, 0, 99999);
    const idx = pickIdx(party, p=>p.alive);
    if (idx>=0) party[idx].health = clamp(party[idx].health - rand(0,3), 0, 100);
    advanceDays(1);
    pushLog((idx>=0? party[idx].name : 'Someone') + ` hunts and brings back ${gain} lb of food (used ${bullets} ammo).`);
    triggerEvent('hunt', 0.45);
    uiUpdate(); checkEnd();
  }

  function doForage(){
    if (modalOpen) return;
    const mult = computeBonuses(party).forageMultiplier;
    const gain = Math.round(rand(5,14) * mult);
    food = clamp(food + gain - 1, 0, 99999);
    advanceDays(1);
    pushLog('The party forages and finds ' + gain + ' lb of food.');
    triggerEvent('forage', 0.45);
    uiUpdate(); checkEnd();
  }

  function doNextDay(){
    if (modalOpen) return;
    let foodDelta = -Math.ceil(baseFoodUse()/2) - rand(0,2);
    let healthDelta = baseHealthDelta() + rand(-1,1);
    let milesDelta = rand(-1,1);
    food = clamp(food + foodDelta, 0, 99999);
    applyGroupHealth(healthDelta);
    miles = clamp(miles + Math.max(0, milesDelta), 0, DESTINATION_MILES);
    advanceDays(1);
    pushLog('The trail continues.');
    triggerEvent('camp', 0.5);
    uiUpdate(); checkEnd();
  }

  function doBuy(){
    if (modalOpen) return;
    const spend = Math.min(money, rand(3,12));
    if (spend <= 0){ pushLog('You have no money to trade.'); return; }
    money -= spend;
    const randomGoods = rand(1,3);
    if (randomGoods === 1) { food = clamp(food + spend*5, 0, 99999); pushLog('You buy food for $' + spend + '.'); }
    if (randomGoods === 2) { ammo = clamp(ammo + spend*4, 0, 99999); pushLog('You buy ammunition for $' + spend + '.'); }
    if (randomGoods === 3) { spareParts = clamp(spareParts + 1, 0, 99999); pushLog('You buy a spare part for $' + spend + '.'); }
    uiUpdate();
  }

  function resetGame(){
    party = party.map(p=>({ name:p.name, prof:p.prof||"None", health:100, alive:true }));
    graves = [];
    food = 0; miles = 0; day = 1;
    pace = 'steady'; rations = 'normal';
    oxenTeams = 0; clothingSets = 0; ammo = 0; spareParts = 0;
    crossed = RIVERS.map(()=>false); currentRiver = -1;
    // start month from control
    const startOpt = selStartMonth.value; // March..July
    curMonthIdx = {March:2, April:3, May:4, June:5, July:6}[startOpt] || 3;
    curDayOfMonth = 1;
    shortcutsEnabled = true; modalOpen = false;
    money = startingBudget();
    openShop();
    uiUpdate();
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e)=>{
    if (!shortcutsEnabled || modalOpen) return;
    if (isTypingTarget(e.target)) return;
    const k = e.key.toLowerCase();
    if (k==='t') { e.preventDefault(); doTravel(); }
    if (k==='r') { e.preventDefault(); doRest(); }
    if (k==='h') { e.preventDefault(); doHunt(); }
    if (k==='f') { e.preventDefault(); doForage(); }
    if (k==='n') { e.preventDefault(); doNextDay(); }
    if (k==='b') { e.preventDefault(); doBuy(); }
  });
  chkShortcuts.addEventListener('change', ()=>{ shortcutsEnabled = chkShortcuts.checked; });

  // Wire controls
  function wire(){
    document.getElementById('btnTravel').onclick = doTravel;
    document.getElementById('btnRest').onclick = doRest;
    document.getElementById('btnHunt').onclick = doHunt;
    document.getElementById('btnForage').onclick = doForage;
    document.getElementById('btnNext').onclick = doNextDay;
    document.getElementById('btnBuy').onclick = doBuy;
    document.getElementById('btnReset').onclick = resetGame;
    document.getElementById('btnAdd').onclick = function(){
      if (party.length >= MAX_PARTY) return;
      party.push({ name:'New Traveler', prof:'None', health:100, alive:true });
      saveParty(); uiUpdate();
    };
    selPace.onchange = (e)=>{ pace = e.target.value; uiUpdate(); };
    selRations.onchange = (e)=>{ rations = e.target.value; uiUpdate(); };
  }

  // Shop logic
  function updateShopBudget(){
    const budget = startingBudget();
    const cost = siOxen.valueAsNumber * 40
               + siFood.valueAsNumber * 0.20
               + siClothing.valueAsNumber * 10
               + siAmmoBoxes.valueAsNumber * 2
               + siParts.valueAsNumber * 15;
    const remaining = clamp((budget - cost), -99999, 99999);
    shopBudget.textContent = '$' + budget.toFixed(2);
    shopRemaining.textContent = '$' + remaining.toFixed(2);
    document.getElementById('shopBegin').disabled = remaining < 0 || siOxen.valueAsNumber < 1 || siFood.valueAsNumber < 1 || party.length < 1;
  }
  [siOxen, siFood, siClothing, siAmmoBoxes, siParts].forEach(inp=>{ inp.addEventListener('input', updateShopBudget); });

  function openShop(){
    siOxen.value = 1; siFood.value = 200; siClothing.value = String(Math.max(4, party.length)); siAmmoBoxes.value = 6; siParts.value = 2;
    updateShopBudget();
    shop.style.display = 'flex'; modalOpen = true;
  }
  btnCancel.addEventListener('click', ()=>{ openShop(); });
  btnBegin.addEventListener('click', ()=>{
    const budget = startingBudget();
    const spent = (siOxen.valueAsNumber * 40 + siFood.valueAsNumber * 0.20 + siClothing.valueAsNumber * 10 + siAmmoBoxes.valueAsNumber * 2 + siParts.valueAsNumber * 15);
    money = budget - spent;
    oxenTeams = siOxen.valueAsNumber;
    food = siFood.valueAsNumber;
    clothingSets = siClothing.valueAsNumber;
    ammo = siAmmoBoxes.valueAsNumber * 20;
    spareParts = siParts.valueAsNumber;
    shop.style.display = 'none'; modalOpen = false;
    pushLog('Your party sets out at dawn. ('+fmtDate()+')');
    uiUpdate();
  });

  // River UI
  rvFord.addEventListener('click', ()=>riverOutcome('ford'));
  rvFloat.addEventListener('click', ()=>riverOutcome('float'));
  rvFerry.addEventListener('click', ()=>riverOutcome('ferry'));
  rvWait.addEventListener('click', ()=>riverOutcome('wait'));

  // End screens buttons
  vicReset.addEventListener('click', resetGame);
  defReset.addEventListener('click', resetGame);

  // Init
  wire();
  resetGame(); // opens shop
})();



document.addEventListener("DOMContentLoaded", function(){
  const overlay = document.getElementById('welcomeOverlay');
  const contBtn = document.getElementById('continueBtn');
  if(overlay && contBtn){
    contBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }
});
