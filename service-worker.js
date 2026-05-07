const CACHE_NAME = "adhkar-v4";

self.addEventListener("install", event => {
  self.skipWaiting(); // يشغّل النسخة الجديدة فورًا
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // يجبر المتصفح يستخدم الجديد فورًا
});

// مهم جدًا: دايمًا هات من الشبكة أولاً
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});