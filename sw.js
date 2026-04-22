const CACHE = 'tuition-firebase-v1';
const CORE  = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Cache Firebase SDK, fonts, React from CDN
  if (url.includes('gstatic.com') || url.includes('googleapis.com') ||
      url.includes('unpkg.com') || url.includes('fonts.google')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const net = fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          });
          return cached || net;
        })
      )
    );
    return;
  }
  // Firebase API calls — always network (never cache)
  if (url.includes('firestore.googleapis.com') || url.includes('identitytoolkit')) {
    return; // let Firebase SDK handle these
  }
  // App shell — cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
