/* Haltbar – Service Worker: speichert die App auf dem Handy, damit sie auch offline startet.
 * Bei jeder Änderung an App-Dateien: VERSION hier und ?v= in index.html erhöhen.
 */
const VERSION = 'haltbar-v3';
const ASSET_V = '3';

importScripts('foods.js?v=' + ASSET_V);

const SHELL = [
  './',
  'index.html',
  'styles.css?v=' + ASSET_V,
  'foods.js?v=' + ASSET_V,
  'recipes.js?v=' + ASSET_V,
  'app.js?v=' + ASSET_V,
  'manifest.webmanifest',
  'icons/icon-192.png?v=' + ASSET_V,
  'icons/icon-512.png?v=' + ASSET_V,
  'icons/maskable-512.png?v=' + ASSET_V,
  'icons/apple-touch-icon.png?v=' + ASSET_V,
  'icons/favicon.png?v=' + ASSET_V,
  'img/empty.webp',
  'img/install.webp',
];
const IMAGES = self.Foods.list.map((ic) => 'food/' + ic.key + '.webp');

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    // Bilder einzeln – ein fehlendes Bild soll die Installation nicht verhindern
    await Promise.allSettled(IMAGES.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(req.mode === 'navigate' ? networkFirst(req, url) : cacheFirst(req));
});

// Seite: erst Internet (neueste Version), nach 4 s oder offline die gespeicherte
async function networkFirst(req, url) {
  const cache = await caches.open(VERSION);
  const isApp = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    if (isApp && res.ok) cache.put('index.html', res.clone());
    return res;
  } catch (e) {
    return (await cache.match(isApp ? 'index.html' : req)) || (await cache.match('./')) || Response.error();
  }
}

// Dateien: aus dem Speicher, sonst aus dem Internet (und merken)
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(VERSION);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    return Response.error();
  }
}
