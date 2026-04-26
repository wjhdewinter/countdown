const CACHE_NAME = "final-countdown-pro-v4";
const ASSETS = [
  "/Test/",
  "/Test/index.html",
  "/Test/style.css?v=4",
  "/Test/app.js?v=4",
  "/Test/manifest.json",
  "/Test/icons/icon-192.png",
  "/Test/icons/icon-512.png",
  "/Test/icons/maskable-192.png",
  "/Test/icons/maskable-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
