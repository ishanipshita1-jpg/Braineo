// ============================================
// BRAINEO - Service Worker
// Offline functionality, caching, install prompts
// ============================================

const CACHE_NAME = 'braineo-v1.0.0';
const OFFLINE_URL = '/index.html';

// Files to cache for offline use
const CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/games/snake.html',
  '/games/snake.css',
  '/games/snake.js',
  '/games/math.html',
  '/games/math.css',
  '/games/math.js',
  '/games/memory.html',
  '/games/memory.css',
  '/games/memory.js',
  '/assets/ambient.mp3'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[Service Worker] All files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          
          // Update cache in background (stale-while-revalidate)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                  });
              }
            })
            .catch(() => {
              // Network failed, but we have cache
            });
          
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // If offline and requesting HTML, show offline page
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
            
            throw error;
          });
      })
  );
});

// Background sync for stats (when online)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-stats') {
    event.waitUntil(syncStats());
  }
});

async function syncStats() {
  // Sync stats to server when online
  // For now, just log (can implement server sync later)
  console.log('[Service Worker] Stats synced');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'BRAINEO';
  const options = {
    body: data.body || 'Time for a brain workout!',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'play', title: 'Play Now' },
      { action: 'close', title: 'Later' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Periodic background sync (future feature - daily challenges)
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync:', event.tag);
  
  if (event.tag === 'daily-challenge') {
    event.waitUntil(checkDailyChallenge());
  }
});

async function checkDailyChallenge() {
  // Check if new daily challenge available
  console.log('[Service Worker] Checking daily challenge');
}

// Message handling (communicate with main app)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          console.log('[Service Worker] Cache cleared');
          return caches.open(CACHE_NAME);
        })
        .then((cache) => {
          return cache.addAll(CACHE_FILES);
        })
    );
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[Service Worker] Loaded successfully');
