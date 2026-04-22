// ═══════════════════════════════════════════════════════════════
// TUITION TRACKER — Service Worker
// Pre-caches ALL dependencies so app works 100% offline
// after the very first load (when internet was available).
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'tuition-v2';

// Everything the app needs to run — all cached during install
const PRE_CACHE = [
  // App shell
  './index.html',
  './manifest.json',
  './icon.svg',

  // React
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',

  // Babel (compiles JSX in browser)
  'https://unpkg.com/@babel/standalone/babel.min.js',

  // Firebase SDK
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',

  // Google Fonts stylesheet
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;600;700;800&display=swap',
];

// ── INSTALL: download and cache everything up front ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching all dependencies…');
      // allSettled so one failed URL doesn't block the whole install
      return Promise.allSettled(
        PRE_CACHE.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] Could not pre-cache:', url, err.message)
          )
        )
      );
    }).then(() => {
      console.log('[SW] Install complete — app ready for offline use');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: remove old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removing old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first for app assets, passthrough for Firebase ──
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // ✋ Never intercept Firebase network calls
  // Firebase SDK manages its own offline queue internally
  if (
    url.includes('firestore.googleapis.com')      ||
    url.includes('firebase.googleapis.com')        ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com')     ||
    url.includes('firebaseinstallations.googleapis.com')
  ) {
    return; // pass through to Firebase SDK
  }

  // ✅ Cache-first for everything else (app shell + CDN scripts)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve from cache immediately (works offline ✓)
        // Refresh cache in background when online
        fetch(event.request)
          .then(res => {
            if (res && res.ok) {
              caches.open(CACHE_NAME)
                .then(c => c.put(event.request, res.clone()));
            }
          })
          .catch(() => {}); // silent — we're offline, cache already served
        return cached;
      }

      // Not cached yet — fetch from network and cache it
      return fetch(event.request)
        .then(res => {
          if (res && res.ok && event.request.method === 'GET') {
            caches.open(CACHE_NAME)
              .then(c => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() => {
          // Completely offline and not cached
          // For page navigations, return the app shell
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline — resource not cached', {
            status: 503,
            statusText: 'Offline'
          });
        });
    })
  );
});

// ── MESSAGE: allow app to trigger SW update ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
