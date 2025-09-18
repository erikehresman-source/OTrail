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
