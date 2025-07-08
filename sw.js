const CACHE_NAME = 'calendario-astral-cache-v1';
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
  'https://fonts.googleapis.com/css2?family=Linux+Libertine:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Evento de instalación: se abre el caché y se añaden los archivos del App Shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de activación: se limpian los cachés antiguos para evitar conflictos.
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
    })
  );
  return self.clients.claim();
});

// Evento fetch: intercepta las peticiones de red.
// Estrategia: "Cache First" para los archivos del shell, y "Network Falling Back to Cache" para los datos.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en el caché, la retornamos.
        if (response) {
          return response;
        }

        // Si no, la buscamos en la red.
        return fetch(event.request).then(
          networkResponse => {
            // Si la petición es válida, la clonamos y la guardamos en el caché para futuras peticiones.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});