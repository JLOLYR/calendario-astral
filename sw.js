// Incrementamos la versión para forzar la actualización
const CACHE_NAME = 'calendario-astral-cache-v5'; 

// Lista de archivos a cachear con rutas RELATIVAS
const URLS_TO_CACHE = [
  './', // Representa la raíz del directorio (muy importante)
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/aspects/Home.png',
  './assets/aspects/Fondo_2.png',
  // URLs de terceros se mantienen igual
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Linux+Libertine:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Evento de instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, añadiendo archivos del App Shell.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('Todos los archivos fueron cacheados exitosamente.');
        return self.skipWaiting();
      })
      .catch(error => {
        // Este log es crucial para depurar si algo vuelve a fallar.
        console.error('Fallo en cache.addAll:', error);
      })
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
        // Si la respuesta está en el caché, la retornamos.
        if (response) {
          return response;
        }
        // Si no, la buscamos en la red.
        return fetch(event.request).then(
          networkResponse => {
            // No cacheamos peticiones de extensiones o fallidas
            if (!networkResponse || networkResponse.status !== 200 || !['basic', 'cors'].includes(networkResponse.type)) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                // Solo cachea peticiones GET válidas
                if(event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
            });
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetch falló; probablemente sin conexión:', error);
            // Podrías devolver una página de fallback aquí si quisieras
        });
      })
  );
});