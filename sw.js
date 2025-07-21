const CACHE_NAME = 'calendario-astral-cache-v1.4'; // Aumentamos la versión para forzar la actualización

// Lista de archivos esenciales para que la app funcione offline.
// Usamos rutas relativas desde la raíz.
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png'
];

// --- 1. Evento de INSTALACIÓN ---
// Se ejecuta una sola vez cuando el Service Worker es nuevo.
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  // waitUntil espera a que la promesa se resuelva para terminar la instalación.
  event.waitUntil(
    // Abrimos el caché con nuestro nombre.
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Guardando archivos principales en caché.');
        // Añadimos todos los archivos de nuestra lista al caché.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// --- 2. Evento de ACTIVACIÓN ---
// Se ejecuta después de la instalación, cuando el SW toma el control.
// Es el lugar perfecto para limpiar cachés antiguos.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        // Borramos cualquier caché que no tenga el nombre del caché actual.
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                  .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  // Le dice al SW que tome el control de la página inmediatamente.
  return self.clients.claim();
});

// --- 3. Evento FETCH (El más importante) ---
// Se ejecuta cada vez que la página hace una petición de red (para un CSS, JS, imagen, etc.).
self.addEventListener('fetch', event => {
  // Ignoramos las peticiones que no son GET.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    // Estrategia "Cache First":
    caches.match(event.request)
      .then(cachedResponse => {
        // Si encontramos una respuesta en el caché, la devolvemos inmediatamente.
        if (cachedResponse) {
          console.log('[Service Worker] Devolviendo desde caché:', event.request.url);
          return cachedResponse;
        }

        // Si no está en el caché, vamos a la red.
        console.log('[Service Worker] Buscando en la red:', event.request.url);
        return fetch(event.request).then(networkResponse => {
            // Si la petición de red es exitosa, la guardamos en el caché para la próxima vez.
            // Esto es crucial para que los archivos JSON de los meses se guarden offline.
            if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
        }).catch(error => {
            // Si tanto el caché como la red fallan, devolvemos una respuesta genérica de error.
            console.error('[Service Worker] Error en fetch:', error);
            // Podrías devolver una página offline personalizada aquí si quisieras.
        });
      })
  );
});