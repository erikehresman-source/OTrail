/* ================================
   Oregon Trail Lite - game.js
   ================================ */

// existing code untouched...
// (your constants, game state, UI functions, event logic, shop setup, trail events, resetGame, etc.)

// --------------------------------
// WELCOME OVERLAY HANDLER
// --------------------------------
document.addEventListener("DOMContentLoaded", function(){
  const overlay = document.getElementById('welcomeOverlay');
  const contBtn = document.getElementById('continueBtn');
  if (overlay && contBtn) {
    contBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
      if (typeof openShop === 'function') {
        openShop();  // show the outfitter
      }
    });
  }
});

// --------------------------------
// INITIALIZE GAME
// --------------------------------
wire();
resetGame();
