// ¡MUY IMPORTANTE! Incrementa la versión para que el navegador instale esta nueva lógica.
const CACHE_NAME = 'calendario-astral-beta'; 

// Lista de archivos a cachear con rutas RELATIVAS
const URLS_TO_CACHE = [
  './', // Representa la raíz del directorio
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

// Evento de instalación (se mantiene igual, ya estaba bien)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, añadiendo archivos del App Shell.');
        // Usamos { cache: 'reload' } para asegurarnos de que estamos cacheando la versión más nueva de la red.
        const requests = URLS_TO_CACHE.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
      .then(() => {
        console.log('Todos los archivos fueron cacheados exitosamente.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Fallo en cache.addAll:', error);
      })
  );
});

// Evento de activación (se mantiene igual, ya estaba bien)
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

// === Evento fetch REESCRITO Y MEJORADO ===
self.addEventListener('fetch', event => {
  const { request } = event;

  // ESTRATEGIA 1: Network First para los archivos de datos JSON.
  // Esto asegura que el usuario siempre tenga la información más actualizada.
  if (request.url.includes('.json') && !request.url.includes('manifest.json')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // Si la respuesta de la red es buena, la clonamos, la guardamos en la caché y la devolvemos.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Si la red falla (está offline), intentamos servir desde la caché.
          console.log('Red falló para JSON, intentando desde la caché...');
          return caches.match(request);
        })
    );
    return; // Salimos para no ejecutar la siguiente estrategia.
  }

  // ESTRATEGIA 2: Cache First para todo lo demás (App Shell, CSS, JS, Fuentes, Imágenes).
  // Es la más rápida para los archivos que no cambian a menudo.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Si la respuesta está en el caché, la retornamos.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si no, la buscamos en la red.
        return fetch(request).then(networkResponse => {
          // No cacheamos peticiones de extensiones de Chrome
          if (request.url.startsWith('chrome-extension://')) {
              return networkResponse;
          }

          // Clonamos, guardamos en caché y devolvemos la respuesta de red.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
  );
});