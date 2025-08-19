# Oregon Trail Lite — PWA Package

This folder was generated from your uploaded files and is ready for GitHub Pages (or any static host).

## Files
- `index.html` — your game with PWA hooks (manifest + service worker)
- `manifest.webmanifest` — app metadata (name, theme, icons)
- `service-worker.js` — cache-first offline support
- `icon-192.png`, `icon-512.png` — placeholder icons (replace later if you want)
- `.nojekyll` — needed for GitHub Pages
- `original_v6.html` — your original upload, unchanged (reference)
- `Oregon_source.docx` — the Word doc you provided (reference)

## Publish on GitHub Pages
1. Create a new repo (or use an existing one).
2. Add **all files** from this folder to the repo root and commit.
3. In **Settings → Pages**, set the source to “Deploy from a branch” (e.g., `main`), and the folder as `/ (root)`.
4. Wait for the Pages URL to appear (e.g., `https://<you>.github.io/<repo>/`).  
5. Open the site. The service worker will install on first load; the app can then be installed from the browser menu.
6. To update, just commit new files — the service worker will refresh automatically after a reload.

## Local testing (optional)
- VS Code + Live Server → Open `index.html`
- or `npx serve` in this folder → open the localhost URL

> Tip: Replace the placeholder icons with your own 192×192 and 512×512 PNGs for a nicer install prompt.
