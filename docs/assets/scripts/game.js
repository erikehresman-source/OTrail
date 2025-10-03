// ===== F1–F3 MVP CORE =====

// Profession budgets (MVP — tune later)
const PROFESSION_BUDGET = {
  banker:    1200,
  farmer:     800,
  carpenter:  700,
  doctor:     900,
  hunter:     700
};

// Outfitter costs
const COST = {
  oxenTeam: 40,   // per (2 oxen)
  foodLb:   0.20, // per lb
  clothes:  10,   // per set
  parts:    15,   // per kit
  ammoBox:   2    // per 20 rounds
};

// Single source of truth
let gameState = {
  party: [],              // [leader, c2, c3, c4]
  profession: "",         // banker/farmer/carpenter/doctor/hunter
  month: "",              // March..July
  money: 0,               // starting budget by profession
  oxen: 0,
  food: 0,
  clothes: 0,
  ammo: 0,
  parts: 0,
  day: 1,
  location: "Independence, Missouri",
  health: 100,
  wagonStatus: 100,
  progress: 0             // 0–100% (wire later)
};

// ---------- Utilities ----------
function $(id){ return document.getElementById(id); }

function setScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el){ el.classList.add('active'); el.setAttribute('tabindex','-1'); el.focus(); }
}

function debug(msg){
  const d = $('debugOverlay');
  if (!d) return;
  d.innerHTML = String(msg);
}

// Recompute remaining budget from current input values
function computeRemaining(){
  const oxen = parseInt($('oxen').value || '0',10);
  const food = parseInt($('food').value || '0',10);
  const clothes = parseInt($('clothes').value || '0',10);
  const parts = parseInt($('parts').value || '0',10);
  const ammo = parseInt($('ammo').value || '0',10);

  const spend =
    (oxen * COST.oxenTeam) +
    (food * COST.foodLb) +
    (clothes * COST.clothes) +
    (parts * COST.parts) +
    (ammo * COST.ammoBox);

  const remain = (gameState.money - spend);
  return { remain, oxen, food, clothes, parts, ammo };
}

function refreshOutfitterUI(){
  const { remain, oxen } = computeRemaining();
  $('budgetRemaining').textContent = remain.toFixed(2);
  // Gate: must have ≥1 oxen team and not overspend
  $('btn-begin').disabled = !(oxen >= 1 && remain >= 0);
}

// ---------- Boot wiring ----------
document.addEventListener('DOMContentLoaded', () => {

  // Welcome → Setup
  $('btn-to-setup').addEventListener('click', () => {
    setScreen('screen-setup');
  });

  // Setup → Outfitter
  $('btn-to-outfitter').addEventListener('click', () => {
    // Collect names
    gameState.party = [
      $('name1').value || 'Leader',
      $('name2').value || 'Companion 2',
      $('name3').value || 'Companion 3',
      $('name4').value || 'Companion 4'
    ];

    // Profession & month
    gameState.profession = $('profession').value;
    gameState.month = $('month').value;

    // Starting budget by profession
    gameState.money = PROFESSION_BUDGET[gameState.profession] || 800;

    // Show Outfitter and reflect budget/profession
    $('profLabel').textContent = gameState.profession[0].toUpperCase() + gameState.profession.slice(1);
    $('budgetStart').textContent = gameState.money.toFixed(2);
    $('budgetRemaining').textContent = gameState.money.toFixed(2);

    // Activate screen and inputs
    setScreen('screen-outfitter');
    ['oxen','food','clothes','parts','ammo'].forEach(id => {
      $(id).addEventListener('input', refreshOutfitterUI);
    });
    refreshOutfitterUI();

    // (Weather placeholder for later)
    // e.g., gameState.weather = monthToSeason(gameState.month)
  });

  // Outfitter → Trail
  $('btn-begin').addEventListener('click', () => {
    const { remain, oxen, food, clothes, parts, ammo } = computeRemaining();
    if (oxen < 1 || remain < 0){ return; }

    // Commit purchases into gameState
    gameState.oxen = oxen;
    gameState.food = food;
    gameState.clothes = clothes;
    gameState.parts = parts;
    gameState.ammo = ammo;
    gameState.money = parseFloat(remain.toFixed(2));

    // Initialize trail UI (minimap shows now)
    $('minimap').hidden = false;
    updateMinimap(0); // start at 0%

    // Seed trail log
    const log = $('log');
    log.innerHTML = '';
    appendLog(`Day ${gameState.day}: Departed Independence, Missouri.`, log);
    appendLog(`Supplies → Oxen teams: ${gameState.oxen}, Food: ${gameState.food} lbs, Clothes: ${gameState.clothes}, Parts: ${gameState.parts}, Ammo: ${gameState.ammo} boxes.`, log);
    appendLog(`Cash remaining: $${gameState.money.toFixed(2)}`, log);

    setScreen('screen-trail');
    debug(`Day: ${gameState.day} | Food: ${gameState.food} | Health: ${gameState.health} | $${gameState.money.toFixed(2)}`);
  });

  // Next Day (simple stub)
  $('btn-next-day').addEventListener('click', () => {
    gameState.day++;
    // Simple daily drain for MVP sanity test
    const dailyEat = Math.max(0, 4 + Math.floor(gameState.party.length / 2)); // small baseline drain
    gameState.food = Math.max(0, gameState.food - dailyEat);

    if (gameState.food === 0){
      gameState.health = Math.max(0, gameState.health - 5);
    }

    // Progress placeholder (advance a little)
    const pct = Math.min(100, Math.floor((gameState.day / 150) * 100));
    updateMinimap(pct);

    // Log
    appendLog(`Day ${gameState.day}: The trail is clear. (Food -${dailyEat} lbs)`, $('log'));
    debug(`Day: ${gameState.day} | Food: ${gameState.food} | Health: ${gameState.health} | $${gameState.money.toFixed(2)}`);
  });

});

// ---------- Helpers ----------
function appendLog(text, container){
  const div = document.createElement('div');
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function updateMinimap(percent){
  gameState.progress = percent;
  const wagon = $('minimap-wagon');
  const label = $('minimap-label');
  if (wagon){
    const clamped = Math.max(0, Math.min(100, percent));
    wagon.style.left = `${clamped}%`;
    if (clamped >= 100) wagon.style.left = '100%';
  }
  if (label){
    label.textContent = `${Math.max(0, Math.min(100, percent))}%`;
  }
}

// (Optional future) function monthToSeason(m){ ... }