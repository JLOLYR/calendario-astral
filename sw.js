// Incrementamos la versión para forzar la actualización
const CACHE_NAME = 'calendario-astral-cache-v4'; 

// Lista de archivos a cachear (con las URLs de las fuentes corregidas)
const URLS_TO_CACHE = [
  '/calendario-astral/',
  '/calendario-astral/index.html',
  '/calendario-astral/style.css',
  '/calendario-astral/script.js',
  '/calendario-astral/manifest.json',
  '/calendario-astral/assets/icons/icon-192x192.png',
  '/calendario-astral/assets/icons/icon-512x512.png',
  '/calendario-astral/assets/aspects/Home.png',
  '/calendario-astral/assets/aspects/Fondo_2.png',
  // URLs CORRECTAS de Google Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Linux+Libertine:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Evento de instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto y archivos del App Shell añadidos');
        // Usamos fetch individual para ignorar errores en peticiones a terceros
        const promises = URLS_TO_CACHE.map(url => {
          return fetch(url, { mode: 'no-cors' }).then(response => {
            return cache.put(url, response);
          }).catch(err => {
            console.warn(`No se pudo cachear ${url}:`, err);
          });
        });
        return Promise.all(promises);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpiando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(networkResponse => {
            let responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                if(event.request.method === 'GET' && event.request.url.startsWith('http')) {
                    cache.put(event.request, responseToCache);
                }
            });
            return networkResponse;
        });
      })
  );
});