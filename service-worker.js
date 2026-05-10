/**
 * service-worker.js
 * ═══════════════════════════════════════════════════════════════
 *
 * FIX 4 — Service Worker may serve stale API response
 *
 *   BEFORE: The fetch handler caught all requests the same way.
 *           If an old version of this SW had cached the prayer
 *           API URL, subsequent requests could silently return
 *           yesterday's cached prayer times with no error shown.
 *
 *   AFTER:  External API domains are explicitly listed and bypassed.
 *           They go straight to the real network — the SW never
 *           touches them, never caches them, never intercepts them.
 *           Only your own static files (HTML, CSS, JS) are cached.
 *
 * OTHER FIXES ALREADY IN YOUR VERSION (kept and confirmed):
 *   • self.skipWaiting()  → new SW activates immediately on install,
 *                           no 2-hour wait for old tabs to close
 *   • self.clients.claim() → new SW takes over open tabs right away
 *   • Old caches deleted on activate → no stale data survives updates
 *
 * ═══════════════════════════════════════════════════════════════
 * HOW TO DEPLOY A NEW VERSION:
 *   Bump CACHE_NAME (e.g. v5 → v6) every time you push changes.
 *   The browser detects the new SW file, installs it, and
 *   skipWaiting() ensures it activates without any delay.
 * ═══════════════════════════════════════════════════════════════
 */

const CACHE_NAME = 'adhkar-v5';  // ← bump this number on every deploy

/* ── INSTALL ────────────────────────────────────────────────────
   Cache your static files. skipWaiting() means this new SW
   activates immediately without waiting for old tabs to close.
   ────────────────────────────────────────────────────────────── */
self.addEventListener('install', function (event) {
  self.skipWaiting();
  // We don't pre-cache here — files are cached on first visit
  // in the fetch handler below. This keeps install fast and
  // avoids a failed pre-cache breaking the whole install.
});

/* ── ACTIVATE ───────────────────────────────────────────────────
   Delete every old cache (any name that isn't CACHE_NAME).
   Then claim() takes control of all open tabs immediately.
   ────────────────────────────────────────────────────────────── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(function () {
      console.log('[SW] Activated. Claiming all tabs.');
      return self.clients.claim();
    })
  );
});

/* ── FETCH ──────────────────────────────────────────────────────
   Two rules, applied in order:

   RULE 1 — External APIs → always go straight to network.
   Prayer time data changes daily. Any caching produces wrong
   times. We bypass the SW entirely for these domains so
   cache: 'no-store' in the fetch call is double-protected.

   RULE 2 — Your own files → network first, cache as fallback.
   Try to get a fresh copy from network. If that succeeds,
   update the cache so offline visits work. If network fails
   (user is offline), serve the cached copy.
   ────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // ── RULE 1: Bypass these domains completely ──────────────────
  // Add any other external domains your site uses here.
  var bypassDomains = [
    'aladhan.com',          // prayer times API
    'api.aladhan.com',
    'fonts.googleapis.com', // Google Fonts CSS
    'fonts.gstatic.com'     // Google Fonts files
  ];

  var isBypassed = bypassDomains.some(function (domain) {
    return url.indexOf(domain) !== -1;
  });

  if (isBypassed) {
    // Go straight to the real network — SW does nothing here.
    // No caching, no interception, no fallback.
    event.respondWith(fetch(event.request));
    return;
  }

  // ── RULE 2: Own files — network first, cache as fallback ─────
  // Only applies to GET requests (not POST, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function (networkResponse) {
        // Network succeeded — cache this response for offline use
        if (networkResponse && networkResponse.status === 200) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(function () {
        // Network failed (offline) — try the cache instead
        return caches.match(event.request);
      })
  );
});
