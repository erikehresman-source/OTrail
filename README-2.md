# OTrail — Manifest & Icons Update (v2)

Drop these files in your repo root to refresh icons & manifest:

- index.html — your v6 game with manifest + apple-touch-icon + SW (v2) wired in
- manifest.webmanifest — references 152/192/512 icons (no leading slashes for GH Pages)
- service-worker.js — cache bumped to v2 to clear old assets
- icon-152.png, icon-192.png, icon-512.png — wagon icons
- .nojekyll — keeps Pages from interfering

After pushing, **hard refresh** the site and, on mobile, **remove** the old Home Screen app and **add again** to see the new icon.
