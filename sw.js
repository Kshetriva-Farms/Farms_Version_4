const CACHE_NAME = 'kshetriva-farms-cache-v13';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './blog.html',
  './styles.css',
  './script.js',
  './blog.js',
  './robots.txt',
  './sitemap.xml',
  './manifest.json',
  './images/favicon.png',
  './images/logo_pwa_192.png',
  './images/logo_pwa_512.png',
  './images/logo_nav_new.png',
  './images/blog_brand_hero.jpg',
  './images/blog_delivery_box.png',
  './images/blog_quality_control.png',
  './images/blog_fresh_dew.png',
  './images/blog_farmer_pick.png',
  './images/blog_cooking_fresh.png',
  './images/blog_market_cart.jpg',
  './images/blog_hand_tomatoes.jpg',
  './images/blog_packing_crates.jpg'
];

// Perform install steps and cache initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🌾 Service Worker: Pre-caching static assets successfully.');
        const cacheRequests = ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(cacheRequests);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch events with Network-First for HTML/CSS/JS and Cache-First for Heavy Media
self.addEventListener('fetch', (event) => {
  // Only handle requests originating from our server
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isStaticCodeAsset = url.pathname.endsWith('.css') || 
                            url.pathname.endsWith('.js') || 
                            url.pathname.endsWith('.json') || 
                            url.pathname.endsWith('.xml') || 
                            event.request.mode === 'navigate';

  if (isStaticCodeAsset) {
    // Network-First Strategy: Fetch from internet first, save clean cache, fallback to cache on network fail
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request, { ignoreSearch: true })
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
              }
            });
        })
    );
  } else {
    // Cache-First Strategy for heavy media assets (images, videos, etc.)
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true })
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
    );
  }
});

// Clean up old deprecated caches on activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`🌾 Service Worker: Deleting deprecated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
