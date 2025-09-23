let gameState = {
    budget: 300,
    party: [],
    profession: "",
    month: "",
    day: 1
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function updateBudget() {
    const oxen = parseInt(document.getElementById("oxen").value) || 0;
    const food = parseInt(document.getElementById("food").value) || 0;
    const clothes = parseInt(document.getElementById("clothes").value) || 0;
    const parts = parseInt(document.getElementById("parts").value) || 0;
    const ammo = parseInt(document.getElementById("ammo").value) || 0;

    const cost = (oxen * 40) + (food * 0.2) + (clothes * 10) + (parts * 15) + (ammo * 2);
    const remaining = gameState.budget - cost;
    document.getElementById("budget").textContent = remaining.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("game.js loaded and DOM ready");

    const debug = document.createElement("div");
    debug.id = "debug";
    debug.style.position = "fixed";
    debug.style.bottom = "10px";
    debug.style.left = "10px";
    debug.style.background = "rgba(0,0,0,0.8)";
    debug.style.color = "lime";
    debug.style.padding = "4px";
    debug.style.fontSize = "12px";
    document.body.appendChild(debug);

    function logDebug(msg) {
        debug.innerHTML += msg + "<br>";
        console.log(msg);
    }

    // Welcome → Party Setup
    const cont = document.getElementById("continueBtn");
    if (cont) {
        logDebug("Found Continue button");
        cont.addEventListener("click", () => {
            logDebug("Continue button clicked");
            document.getElementById("welcomeOverlay").style.display = "none";
            showScreen("partySetup");
        });
    } else {
        logDebug("Continue button NOT found");
    }

    // Party Setup → Outfitter
    const setupBtn = document.getElementById("startSetup");
    if (setupBtn) setupBtn.addEventListener("click", () => {
        gameState.party = [
            document.getElementById("member1").value || "Leader",
            document.getElementById("member2").value || "Member 2",
            document.getElementById("member3").value || "Member 3",
            document.getElementById("member4").value || "Member 4"
        ];
        gameState.profession = document.getElementById("profession").value;
        gameState.month = document.getElementById("month").value;
        showScreen("outfitter");
        updateBudget();
    });

    // Budget inputs
    ["oxen", "food", "clothes", "parts", "ammo"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", updateBudget);
    });

    // Outfitter → Trail Log
    const beginBtn = document.getElementById("beginJourney");
    if (beginBtn) beginBtn.addEventListener("click", () => {
        showScreen("trailLog");
        document.getElementById("logEntries").innerHTML = "Day 1: You set out on the trail.";
    });

    // Trail progression
    const nextDayBtn = document.getElementById("nextDay");
    if (nextDayBtn) nextDayBtn.addEventListener("click", () => {
        gameState.day++;
        const log = document.createElement("div");
        log.textContent = `Day ${gameState.day}: You continue your journey.`;
        document.getElementById("logEntries").appendChild(log);
    });
});


// === Daily Progression System ===
let day = 1;
let food = 200;
let health = 100;

document.getElementById("nextDay").addEventListener("click", nextDay);

function nextDay() {
  updateMiniMap();
  day++;
  food -= 5; // reduce food
  if (food < 0) {
    food = 0;
    health -= 10; // starvation penalty
  }

  // Random event stub
  let roll = Math.random();
  if (roll < 0.1) {
    triggerEvent("sickness");
  } else if (roll < 0.15) {
    triggerEvent("brokenWagon");
  } else {
    logUpdate(`Day ${day}: The trail is clear.`);
  }

  // Game over check
  if (health <= 0) {
    logUpdate("Your party has perished.");
    document.getElementById("nextDay").disabled = true;
  }
}

function logUpdate(msg) {
  const log = document.getElementById("logEntries");
  const entry = document.createElement("div");
  entry.className = "item";
  entry.textContent = msg;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// Simple event stub popup
function triggerEvent(type) {
  let msg = "";
  if (type === "sickness") msg = "Stub Event: Someone fell ill!";
  if (type === "brokenWagon") msg = "Stub Event: The wagon wheel broke!";
  logUpdate(`Day ${day}: ${msg}`);
}


// Debug Overlay
function updateDebugOverlay() {
  const overlay = document.getElementById("debugOverlay");
  if (!overlay) return;
  overlay.textContent = `Day: ${day} | Food: ${food} | Health: ${health}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateDebugOverlay();
});


// Toggle Debug Overlay
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleDebug");
  const overlay = document.getElementById("debugOverlay");
  if (toggleBtn && overlay) {
    toggleBtn.addEventListener("click", () => {
      if (overlay.style.display === "none") {
        overlay.style.display = "block";
        toggleBtn.textContent = "Hide Debug";
      } else {
        overlay.style.display = "none";
        toggleBtn.textContent = "Show Debug";
      }
    });
    toggleBtn.textContent = "Hide Debug"; // initial label
  }
});


// === Mini-map Update Function ===
function updateMiniMap() {
  const totalDays = 150;
  const progress = Math.min(100, (day / totalDays) * 100);
  const wagon = document.getElementById("wagonIcon");
  const label = document.getElementById("minimap-label");
  if (wagon && label) {
    wagon.style.left = progress + "%";
    label.style.left = progress + "%";
    label.textContent = progress.toFixed(0) + "%";
  }
  console.log("Mini-map progress:", progress.toFixed(0) + "%");
  const debugOverlay = document.getElementById("debugOverlay");
  if (debugOverlay) {
    debugOverlay.innerHTML += `<br>Mini-map progress: ${progress.toFixed(0)}%`;
  }
}
