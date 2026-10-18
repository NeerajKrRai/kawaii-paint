# 🎨 Neeksha's Kawaii Paint

A kawaii drawing app for kids — paint with pastel brushes and cute stamps, then
keep every picture in your own gallery. Part of **[Neeksha's Apps](https://apps.neeksha.com)**.

**Live:** https://apps.neeksha.com/kawaii-paint/

## What it does
- Draw with a smooth brush — 12 colours, 3 sizes, an eraser, undo, start-over
- Kawaii stamps (🌸 ⭐ 💖 🦋 🌈 …) you tap onto the paper
- **Save** paintings to a gallery and reopen, download (PNG) or delete them
- Works fully **offline** (PWA) and installs to the home screen

## How it's built
Zero backend, no network, no tracking — a static site. Paintings are stored
**on the device** in IndexedDB; nothing is uploaded anywhere. Classic scripts in
one global scope (no bundler): `data → store → paint → gallery → app → pwa`.
Self-hosted fonts (Playfair Display + DM Sans), network-first service worker.

## Layout
```
www/            ← the whole app (served at the /kawaii-paint/ path)
  index.html
  css/styles.css
  js/*.js        data, store, paint, gallery, app, pwa
  fonts/ icons/  self-hosted
  manifest.json  sw.js
```

## Deploy
Site is the `gh-pages` branch (contents of `www/` + `.nojekyll`). Refresh it with
`git commit-tree HEAD:www` and force-push. The domain lives on the hub repo
(`NeerajKrRai.github.io`) — **do not add a CNAME here.**

*Made with love — ♪( ´∀｀)人(´∀｀ )♪ ～♥*
