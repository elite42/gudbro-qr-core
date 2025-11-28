// Service Worker - Hub Aggregator PWA
// Cache Strategy: Network First (API), Cache First (Assets)

const CACHE_NAME = 'hub-aggregator-v1';
const RUNTIME_CACHE = 'hub-runtime-v1';

// Files to cache on install
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - different strategies per resource type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - Network First (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Hub pages - Network First (fresh data priority)
  if (url.pathname.match(/^\/[a-zA-Z0-9]{6,10}$/)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache First
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request));
});

// Network First Strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // No cache, return offline page
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    // For other requests, return error response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background Sync (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync queued analytics when back online
  const db = await openDB();
  const queue = await db.getAll('analytics-queue');
  
  for (const item of queue) {
    try {
      await fetch('/api/analytics/sync', {
        method: 'POST',
        body: JSON.stringify(item)
      });
      await db.delete('analytics-queue', item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Push Notifications (future enhancement)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.url
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Hub Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
