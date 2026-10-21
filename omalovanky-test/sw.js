// Keeps Larine omaľovánky working with no internet (car, plane).
// Everything the app needs is stored on install: both languages, the voice recordings and the icons.
// The font is inside index.html, so nothing is loaded from other websites.
const CACHE = 'larine-omalovanky-test-20261021-113808';
const CORE = ['./', './index.html', './en/', './en/index.html', './clips-sk.js', './clips-en.js', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (err) {
      if (req.mode === 'navigate') return caches.match(url.pathname.includes('/en/') ? './en/index.html' : './index.html');
      throw err;
    }
  })());
});
