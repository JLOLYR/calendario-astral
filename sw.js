// sw.js CORREGIDO

// --- CAMBIO 1: Hacemos un nombre de caché más específico para evitar conflictos ---
const CACHE_NAME = 'calendario-astral-cache-v1.1'; 

// --- CAMBIO 2: Simplificamos y corregimos las rutas ---
const URLS_TO_CACHE = [
  './', // Esto representa la carpeta raíz del proyecto
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  // --- Las rutas a tus assets también deben ser relativas ---
  './assets/icons/icon-192x192.png',
  './assets-512x512.png',
  './assets/aspects/Home.png',
  './assets/aspects/Fondo_2.png'
  // --- CAMBIO 3: Hemos eliminado las URLs externas de esta lista ---
  // El fetch listener las cacheará automáticamente la primera vez.
];

// Evento de instalación (sin cambios en la lógica)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, añadiendo archivos principales.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        // --- AÑADIDO: Un log de error más específico para depurar ---
        console.error('Fallo al ejecutar cache.addAll:', error);
      })
  );
});

// Evento de activación (sin cambios en la lógica)
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

// Evento fetch (sin cambios, tu lógica es excelente)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          networkResponse => {
            // Tu lógica aquí es buena, pero podemos simplificar la condición un poco
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            // Para URLs externas (como Google Fonts), el tipo de respuesta puede ser 'opaque'.
            // Tu código ya las manejará bien.
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