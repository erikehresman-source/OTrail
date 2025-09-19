let gameState = {
    budget: 300,
    party: [],
    profession: "",
    month: "",
    day: 1
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
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

    // Welcome → Party Setup
    const cont = document.getElementById("continueWelcome");
    if (cont) {
        cont.addEventListener("click", () => {
            console.log("Continue button clicked");
            showScreen("partySetup");
        });
    } else {
        console.error("Continue button not found");
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


// === Debug Overlay Added ===

document.addEventListener("DOMContentLoaded", () => {
    let debug = document.createElement("div");
    debug.id = "debug";
    debug.style.position = "fixed";
    debug.style.bottom = "10px";
    debug.style.left = "10px";
    debug.style.zIndex = "9999";
    debug.style.background = "rgba(0,0,0,0.7)";
    debug.style.color = "lime";
    debug.style.padding = "5px";
    debug.style.fontSize = "12px";
    document.body.appendChild(debug);

    function logDebug(msg) {
        debug.innerHTML += msg + "<br>";
        console.log(msg);
    }

    logDebug("game.js loaded and DOM ready");

    const cont = document.getElementById("continueWelcome");
    if (cont) {
        logDebug("Found Continue button");
        cont.addEventListener("click", () => {
            logDebug("Continue button clicked");
            showScreen("partySetup");
        });
    } else {
        logDebug("Continue button NOT found");
    }
});
