# Oregon Trail Lite - Changelog

## v9.2
- Added safe central UI rebinding system
- Prevents freezes caused by missing buttons or unbound events
- Added console logging for all major UI actions
- Included helper functions `attachClick` and `attachChange` for safer binding
- Ensures Welcome overlay, Outfitter, and core game buttons always function

## v9.1
- Minor adjustments to image references in index.html
- Fixed issues with service worker caching stale files

## v9.0
- Major refactor of project structure
- Separated CSS into `assets/styles/game.css`
- Separated JS into `assets/scripts/game.js`
- All images moved into `assets/images/`
- Added `.nojekyll` file for GitHub Pages compatibility
- Updated manifest and service worker to reflect new paths

## v8
- Added shopkeeper welcome overlay
- Integrated instructions for rations, professions, renaming party
- Added install app button styling

## v7
- Introduced PWA functionality with manifest + service worker
- Added icons (152, 192, 512)
- Enabled offline caching of index, styles, and scripts

## v6 and earlier
- Basic Oregon Trail Lite game running inline in index.html
- Included outfitter, trail log, and random event system
- All CSS/JS embedded directly in HTML
