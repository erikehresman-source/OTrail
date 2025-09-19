/* ================================
   Oregon Trail Lite - game.js (v9.4 patched)
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Game initialized (v9.4)");
  bindUI();
  bindOutfitterInputs();
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
  attachClick("beginJourney", () => {
    startJourney();
    console.log("Journey started");
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

// --- Budget Handling ---
function recalcBudget() {
  const oxen = parseInt(document.getElementById('oxen')?.value || 0);
  const food = parseInt(document.getElementById('food')?.value || 0);
  const clothing = parseInt(document.getElementById('clothing')?.value || 0);
  const spares = parseInt(document.getElementById('spares')?.value || 0);
  const ammo = parseInt(document.getElementById('ammo')?.value || 0);

  const total = (oxen * 40) + (food * 0.2) + (clothing * 10) + (spares * 15) + (ammo * 2);
  const budget = 300;
  const remaining = budget - total;

  const budgetLabel = document.getElementById('budget');
  if (budgetLabel) {
    budgetLabel.textContent = `Budget: $${remaining.toFixed(2)}`;
  }
}

function bindOutfitterInputs() {
  ['oxen','food','clothing','spares','ammo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', recalcBudget);
  });
  recalcBudget(); // initial calc
}

// --- Begin Journey Stub ---
function startJourney() {
  const outfitter = document.getElementById('outfitter');
  if (outfitter) outfitter.style.display = 'none';

  const log = document.getElementById('logOutput');
  if (log) log.textContent = 'Day 1: On the trail... (stub)';
}

// --- Existing Functions (unchanged placeholders) ---
function travel() { /* your logic here */ }
function rest() { /* your logic here */ }
function hunt() { /* your logic here */ }
function forage() { /* your logic here */ }
function nextDay() { /* your logic here */ }
function trade() { /* your logic here */ }
function setRations(value) { /* your logic here */ }
function setPace(value) { /* your logic here */ }
function openShop() { /* your logic here */ }

if (typeof wire === "function") wire();
if (typeof resetGame === "function") resetGame();
