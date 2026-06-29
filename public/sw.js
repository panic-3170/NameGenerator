const CACHE_NAME = 'namegen-cache-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/about',
  '/privacy',
  '/favicon.svg',
  '/favicon-32x32.svg',
  '/favicon-192x192.svg',
  '/favicon-512x512.svg',
  '/manifest.webmanifest',
  '/og-image.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
