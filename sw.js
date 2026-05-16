const VERSION = "1.5";
const CACHE = "amrum-bus-" + VERSION;

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(["/Amrum-Busverbindungen-Vorsaison/", "/Amrum-Busverbindungen-Vorsaison/index.html", "/Amrum-Busverbindungen-Vorsaison/icon.png"]))
  );
  // Nicht sofort skippen – erst auf Nachricht warten

});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", e => {
  if(e.data?.action === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
