const CACHE_VER    = 'senses-v1';
const CACHE_STATIC = `${CACHE_VER}-static`;
const CACHE_PAGES  = `${CACHE_VER}-pages`;
const CACHE_IMAGES = `${CACHE_VER}-images`;

const PRECACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('senses-') && ![CACHE_STATIC, CACHE_PAGES, CACHE_IMAGES].includes(k))
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Images: stale-while-revalidate (keeps them fast, updates in background)
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, CACHE_IMAGES));
    return;
  }

  // Static assets (JS, CSS, fonts, SVG): cache-first
  if (/\.(js|css|woff2?|ttf|otf|svg|ico|webp|png|jpg|jpeg)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // HTML pages: network-first, offline fallback
  const accept = request.headers.get('accept') ?? '';
  if (request.destination === 'document' || accept.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request, CACHE_PAGES));
    return;
  }
});

// ── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached ?? new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        caches.open(cacheName).then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);

  return cached ?? (await fetchPromise) ?? new Response('', { status: 503 });
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline');
    return offline ?? new Response('<h1>Offline</h1>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
