// Ronki service worker.
//
// CACHE_NAME carries a build-time version token ("mraldpyk6zg01p") that the Vite
// build replaces with a content hash on every `vite build`. In dev, the literal
// token is left in place — that's fine because we only register the SW in
// production builds. Bumping the token happens automatically, so we no longer
// need to manually edit a `ronki-vN` string to invalidate stale caches (that
// manual step bit us twice this sprint with users stuck on old versions).
const CACHE_NAME = "ronki-mraldpyk6zg01p";
const PRECACHE_URLS = [
  "/",
  "/index.html",
];

// Install: cache app shell, skip waiting immediately so the new SW can
// activate on the next page load rather than waiting for all tabs to close.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: delete ALL caches that aren't the current one, then claim
// existing clients so the updated SW controls already-open tabs.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Allow the page to ask the waiting SW to activate immediately (used by the
// "Neu laden" button in SWUpdateBanner).
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: network-first for everything (fresh deploys always win). Fall back
// to cache only if the network is unreachable. Non-GET requests are passed
// through untouched.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
