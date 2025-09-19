/* ================================
   Oregon Trail Lite - game.js (v9.5 patched with text-only daily events)
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
  const gameRoot = document.getElementById("game-root");
  let currentDay = 0;

  // Simple event pool for Phase 1
  const events = [
    "The weather is fair.",
    "Your oxen are tired.",
    "You find a small stream.",
    "A fellow traveler trades stories with you."
  ];

  // Utility: get random event
  function randomEvent() {
    return events[Math.floor(Math.random() * events.length)];
  }

  // ============================
  // Render Outfitter Screen
  // ============================
  function renderOutfitter() {
    gameRoot.innerHTML = `
      <h2>Outfitter — Buy your supplies</h2>
      <p>Tip: You’ll need at least <strong>1 oxen team</strong> and some <strong>food</strong> to begin.</p>
      <form id="outfitter-form">
        <label>Oxen team (2 oxen): <input type="number" id="oxen" value="1" min="0" /> $40 each</label><br/>
        <label>Food (pounds): <input type="number" id="food" value="200" min="0" /> $0.20/lb</label><br/>
        <label>Clothing sets: <input type="number" id="clothes" value="4" min="0" /> $10 each</label><br/>
        <label>Spare parts kits: <input type="number" id="parts" value="2" min="0" /> $15 each</label><br/>
        <label>Ammo (20/box): <input type="number" id="ammo" value="6" min="0" /> $2/box</label><br/>
        <p>Budget: $<span id="budget">300.00</span></p>
        <button type="submit" id="begin-journey">Begin Journey</button>
      </form>
      <div id="trail-log"><h3>Trail Log</h3><div id="log-entries">Your journey begins...</div></div>
    `;

    // Handle budget calculations
    const budgetEl = document.getElementById("budget");
    const form = document.getElementById("outfitter-form");

    function updateBudget() {
      const oxen = parseInt(document.getElementById("oxen").value) || 0;
      const food = parseInt(document.getElementById("food").value) || 0;
      const clothes = parseInt(document.getElementById("clothes").value) || 0;
      const parts = parseInt(document.getElementById("parts").value) || 0;
      const ammo = parseInt(document.getElementById("ammo").value) || 0;

      let budget = 300;
      budget -= (oxen * 40) + (food * 0.20) + (clothes * 10) + (parts * 15) + (ammo * 2);
      budgetEl.textContent = budget.toFixed(2);
    }

    form.addEventListener("input", updateBudget);

    // Begin Journey
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      startJourney();
    });
  }

  // ============================
  // Start Journey (Daily Events)
  // ============================
  function startJourney() {
    gameRoot.innerHTML = `
      <h2>Trail Log</h2>
      <div id="log-entries"></div>
      <button id="next-day">Next Day</button>
    `;
    currentDay = 0;
    logNextDay(); // start Day 1
    document.getElementById("next-day").addEventListener("click", logNextDay);
  }

  // Append daily log
  function logNextDay() {
    currentDay++;
    const log = document.getElementById("log-entries");
    const entry = document.createElement("p");
    entry.textContent = `Day ${currentDay}: ${randomEvent()}`;
    log.appendChild(entry);
  }

  // ============================
  // Welcome Overlay
  // ============================
  function showWelcome() {
    gameRoot.innerHTML = `
      <div class="modal">
        <h2>Welcome to the trading post, settler!</h2>
        <p>So, you’re traveling west? Before you begin, here are some tips for your journey:</p>
        <ul>
          <li>Choose your rations wisely — food runs out faster than you think.</li>
          <li>Rename your party members to personalize your journey.</li>
          <li>Pick a profession carefully — each one has unique advantages.</li>
        </ul>
        <p>Good luck on the trail!</p>
        <button id="continue">Continue</button>
      </div>
    `;
    document.getElementById("continue").addEventListener("click", renderOutfitter);
  }

  // ============================
  // Initialize
  // ============================
  showWelcome();
});


// Show Party Setup screen
function showPartySetup() {
  const outfitter = document.getElementById("outfitter");
  if (outfitter) outfitter.classList.add("hidden");
  const partySetup = document.getElementById("partySetup");
  if (partySetup) partySetup.classList.remove("hidden");
}

// Handle Start Journey button
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startJourneyBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const names = [
        document.getElementById("member1").value || "Leader",
        document.getElementById("member2").value || "Member 2",
        document.getElementById("member3").value || "Member 3",
        document.getElementById("member4").value || "Member 4"
      ];
      const profession = document.getElementById("profession").value;
      const departureMonth = document.getElementById("departureMonth").value;

      window.gameState = window.gameState || {};
      gameState.party = { names, profession, departureMonth };

      // Transition into Trail Log
      document.getElementById("partySetup").classList.add("hidden");
      const log = document.getElementById("logOutput") || document.getElementById("log-entries");
      if (log) {
        log.textContent = `Day 1: Your party departs from Independence, Missouri in ${departureMonth.charAt(0).toUpperCase()+departureMonth.slice(1)}. The journey begins!`;
      }
      const trailLog = document.getElementById("trailLog");
      if (trailLog) trailLog.classList.remove("hidden");
    });
  }
});
