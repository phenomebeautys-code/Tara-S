// TARA-S Service Worker v3
const CACHE = 'tara-s-v3'
const OFFLINE_URL = '/offline'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/offline', '/manifest.json'])
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return

  // Network-first: always try the network, fall back to cache only when offline
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache a fresh copy for offline use
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, copy))
        return response
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  )
})
