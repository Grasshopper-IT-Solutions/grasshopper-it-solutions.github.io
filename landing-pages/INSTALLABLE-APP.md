# Installable web app (PWA)

Lets a visitor install a landing page from the browser, with its own icon on the home screen and a full-screen window. This is a Progressive Web App (PWA).

**Add it when the quote includes the Installable Web App (PWA) premium feature, or the client asks for it.** Otherwise leave it out. Every new page adapts to phones and tablets either way. The calculator's Android and iOS app features are separate store apps built with Expo, and this guide does not cover them. It also works as an add-on to an existing page, when that is requested as its own task (see the standing rule in `CLAUDE.md`).

## What to tell the client

- It is **not** a Google Play Store app or an iOS app. Nothing is published in a store, there are no store fees and no store review.
- **Android** (Chrome, Edge, Samsung Internet): installable from the browser menu, and the page can show its own "Install" button.
- **iPhone / iPad**: only by hand, through the Share menu, then "Add to Home Screen". A page cannot trigger it.
- Other browsers vary: some only offer a home screen shortcut.
- It needs a connection for fresh content. Offline, it shows what was last loaded.
- It does not include push notifications or app-store presence. Quote those separately.

## Fits the current stack

Yes. It is a few static files, with no framework and no build step. GitHub Pages serves HTTPS, which installation requires.

**Set up the final domain first.** An installed app belongs to the address it was installed from. If the page moves from `github.io` to a custom domain, visitors have to install it again.

## Files to add

All paths are relative (`./`), so the same files work under `/<slug>/` and on a custom domain.

### 1. Icons, in `icons/`

| File | Size | Notes |
|---|---|---|
| `icon-192.png` | 192×192 | |
| `icon-512.png` | 512×512 | |
| `icon-maskable-512.png` | 512×512 | Full-bleed background; keep the logo inside the central 80% circle |
| `apple-touch-icon.png` | 180×180 | No transparency |

### 2. `manifest.webmanifest`, at the project root

```json
{
  "name": "<Business Name>",
  "short_name": "<12 characters or fewer>",
  "description": "<One-liner from the brief>",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 3. In `<head>` of `index.html`

```html
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#000000">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
```

### 4. `sw.js`, at the project root

It always tries the network first, so edits show up straight away, and falls back to the saved copy offline. Replace `<slug>`: pages on `github.io` share one origin, so each needs its own cache prefix.

```js
const PREFIX = '<slug>-';
const CACHE = PREFIX + 'v1';
const CORE = ['./', './styles/tailwind.css', './main.js', './contact.config.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      fetch(request)
        .then((response) => {
          if (response.status === 200) event.waitUntil(cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => {
          const saved = await cache.match(request);
          if (saved) return saved;
          if (request.mode === 'navigate') return (await cache.match('./')) || Response.error();
          return Response.error();
        })
    )
  );
});
```

### 5. In `main.js`

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// Optional "Install" button: <button id="install-btn" type="button" hidden>Install app</button>
// It appears only where the browser allows a page to offer installation.
const installBtn = document.getElementById('install-btn');
let installPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  if (!installBtn) return;
  event.preventDefault();
  installPrompt = event;
  installBtn.hidden = false;
});

installBtn?.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.hidden = true;
});
```

Write the button text in the page's language. Check that no utility class on the button (such as `flex` or `inline-block`) overrides `hidden`.

## Check before handover

- [ ] Chrome DevTools, Application tab, Manifest: no errors, all icons load.
- [ ] A real Android phone on the live HTTPS address: the install option appears, the icon and name look right, and the app opens full screen.
- [ ] An iPhone, if the client expects it: "Add to Home Screen" shows the right icon.
- [ ] Airplane mode: the installed app still opens.
- [ ] After a small edit and deploy, the installed app shows the new content.
