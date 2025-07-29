// Contenido para service-worker.js (el único que necesitarás)

// Primero, importamos las librerías de Firebase.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// --- 1. CONFIGURACIÓN DE FIREBASE ---
// Pega tu configuración de Firebase aquí.
const firebaseConfig = {
    apiKey: "AIzaSyAEp97rBImklvm2M0e4yQ0XVO0OQ5LbENg",
    authDomain: "calendario-astral-popup.firebaseapp.com",
    projectId: "calendario-astral-popup",
    storageBucket: "calendario-astral-popup.firebasestorage.app", // CORREGIDO: Asegúrate que sea .appspot.com
    messagingSenderId: "1010299837934",
    appId: "1:1010299837934:web:8ace892d1168d47964c2ff",
    measurementId: "G-ZGW3BLK1W2"
};

// Inicializa Firebase.
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejador para notificaciones en segundo plano.
messaging.onBackgroundMessage((payload) => {
    console.log('Mensaje de Firebase recibido en segundo plano: ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './assets/icons/icon-192x192.png'
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});


// --- 2. LÓGICA DE CACHÉ DE TU PWA ---
const CACHE_NAME = 'calendario-astral-cache-v12'; // Incrementa la versión

const URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  // ... (añade otros assets importantes si quieres)
];

// Evento de instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, añadiendo archivos del App Shell.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de activación para limpiar cachés antiguas
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

// Evento fetch (Estrategia Network-First para JSON, Cache-First para lo demás)
self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.url.includes('.json') && !request.url.includes('manifest.json')) {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            return cachedResponse || fetch(request).then(networkResponse => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});