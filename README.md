# OTrail — Full PWA (Conditional Install Button)

This package uses your uploaded `index.html` as the game and adds:
- `manifest.webmanifest` (relative icon paths for GitHub Pages)
- `service-worker.js` (cache-first offline, v5)
- App icons (152/192/512)
- A **hidden Install App button** that appears **only** when the browser fires `beforeinstallprompt`
- `.nojekyll`

## Deploy
1. Upload **all files** to the root of your `OTrail` repository.
2. In **Settings → Pages**, choose your branch (e.g., `main`) and folder `/ (root)`.
3. Open your Pages URL and hard-refresh.
4. On mobile, if you had a previous install, remove it and Add to Home Screen again.

Enjoy the trail!
