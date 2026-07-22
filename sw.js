const VERSION = "5.1"
const CACHE = "amrum-bus-" + VERSION;
const CORE_ASSETS = [
  "/Amrum-Busverbindungen/",
  "/Amrum-Busverbindungen/index.html",
  "/Amrum-Busverbindungen/icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE_ASSETS))
  );
  // Kein sofortiges skipWaiting hier - das steuert jetzt aktiv die Seite per postMessage,
  // sobald sie eine neu installierte Version erkennt (siehe Service-Worker-Block in index.html).
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
  if (e.data && e.data.action === "skipWaiting") self.skipWaiting();
});

// Netzwerk zuerst, Cache nur als Offline-Fallback: bei jedem normalen Öffnen mit
// Internetverbindung wird automatisch die aktuellste Version vom Server geladen.
// Nur wenn kein Netz da ist, greift die zuletzt erfolgreich geladene Version aus dem Cache.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
