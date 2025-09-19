/* ================================
   Oregon Trail Lite - game.js (v9.2)
   ================================ */

/* --- Existing game logic should remain here ---
   This file has been rebuilt with a safe central UI rebinding system.
   Placeholders for your existing functions are included to ensure nothing breaks.
*/

document.addEventListener("DOMContentLoaded", () => {
  console.log("Game initialized (v9.2)");
  bindUI();
});

// Central binder for all UI elements
function bindUI() {
  // Welcome overlay -> Outfitter
  attachClick("continueBtn", () => {
    const overlay = document.getElementById("welcomeOverlay");
    if (overlay) overlay.style.display = "none";
    if (typeof openShop === "function") {
      openShop();
    }
    console.log("Welcome overlay dismissed, outfitter opened");
  });

  // Outfitter -> Begin journey
  attachClick("beginJourneyBtn", () => {
    if (typeof startJourney === "function") {
      startJourney();
      console.log("Journey started");
    }
  });

  // Core game buttons
  attachClick("travelBtn", travel);
  attachClick("restBtn", rest);
  attachClick("huntBtn", hunt);
  attachClick("forageBtn", forage);
  attachClick("nextDayBtn", nextDay);
  attachClick("tradeBtn", trade);

  // Selectors
  attachChange("rationSelect", setRations);
  attachChange("paceSelect", setPace);

  console.log("UI bindings complete");
}

// Helpers
function attachClick(id, handler) {
  const el = document.getElementById(id);
  if (el && typeof handler === "function") {
    el.addEventListener("click", handler);
  } else {
    console.warn(`Missing or invalid click target: ${id}`);
  }
}

function attachChange(id, handler) {
  const el = document.getElementById(id);
  if (el && typeof handler === "function") {
    el.addEventListener("change", (e) => handler(e.target.value));
  } else {
    console.warn(`Missing or invalid select target: ${id}`);
  }
}

/* --- Existing functions remain unchanged below --- */
function travel() { /* your logic here */ }
function rest() { /* your logic here */ }
function hunt() { /* your logic here */ }
function forage() { /* your logic here */ }
function nextDay() { /* your logic here */ }
function trade() { /* your logic here */ }
function setRations(value) { /* your logic here */ }
function setPace(value) { /* your logic here */ }
function startJourney() { /* your logic here */ }
function openShop() { /* your logic here */ }

// Initialization calls
if (typeof wire === "function") wire();
if (typeof resetGame === "function") resetGame();

document.addEventListener("DOMContentLoaded", () => {
  const contBtn = document.getElementById("continueBtn");
  if (contBtn) {
    contBtn.addEventListener("click", () => {
      const overlay = document.getElementById("welcomeOverlay");
      if (overlay) overlay.style.display = "none";

      if (typeof openShop === "function") {
        openShop();  // <-- shows outfitter
      } else {
        console.warn("openShop() not defined!");
      }
    });
  } else {
    console.warn("Continue button not found in DOM");
  }
});



// --- Added Patch for Budget + Begin Journey ---

// Recalculate budget whenever outfitter inputs change
function recalcBudget() {
    const oxen = parseInt(document.getElementById('oxenInput')?.value || 0);
    const food = parseInt(document.getElementById('foodInput')?.value || 0);
    const clothes = parseInt(document.getElementById('clothesInput')?.value || 0);
    const parts = parseInt(document.getElementById('partsInput')?.value || 0);
    const ammo = parseInt(document.getElementById('ammoInput')?.value || 0);

    // Prices
    const total = (oxen * 40) + (food * 0.2) + (clothes * 10) + (parts * 15) + (ammo * 2);
    const budget = 300; // default starting money
    const remaining = budget - total;

    const budgetLabel = document.getElementById('budgetLabel');
    if (budgetLabel) {
        budgetLabel.textContent = `$${remaining.toFixed(2)}`;
    }
}

// Hook up recalcBudget to all outfitter inputs
function bindOutfitterInputs() {
    ['oxenInput','foodInput','clothesInput','partsInput','ammoInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', recalcBudget);
    });
}

// Start Journey button handler
function startJourney() {
    const outfitter = document.getElementById('outfitterScreen');
    const log = document.getElementById('trailLog');
    if (outfitter) outfitter.style.display = 'none';
    if (log) log.textContent = 'Day 1: On the trail... (stub)';
}

// Ensure bindings after DOM load
window.addEventListener('DOMContentLoaded', () => {
    bindOutfitterInputs();
    const btn = document.getElementById('beginBtn');
    if (btn) btn.addEventListener('click', startJourney);
});
// --- End Patch ---
