// Importa las librerías de Firebase ANTES que cualquier otra cosa.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// ¡MUY IMPORTANTE! Incrementa la versión para forzar la instalación de esta nueva lógica.
const CACHE_NAME = 'calendario-astral-cache-v9'; 

// Lista de archivos a cachear
const URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/aspects/Home.png',
  './assets/aspects/Fondo_2.png',
  // URLs de terceros
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Linux+Libertine:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// --- INICIO: LÓGICA DE FIREBASE MESSAGING ---

// Pega aquí tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAEp97rBImklvm2M0e4yQ0XVO0OQ5LbENg",
    authDomain: "calendario-astral-popup.firebaseapp.com",
    projectId: "calendario-astral-popup",
    storageBucket: "calendario-astral-popup.firebasestorage.app",
    messagingSenderId: "1010299837934",
    appId: "1:1010299837934:web:8ace892d1168d47964c2ff",
    measurementId: "G-ZGW3BLK1W2"
  };

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejador para cuando llega un mensaje con la app en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje de Firebase recibido en segundo plano: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './assets/icons/icon-192x192.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- FIN: LÓGICA DE FIREBASE MESSAGING ---


// Evento de instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, añadiendo archivos del App Shell.');
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
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then(networkResponse => {
          if (request.url.startsWith('chrome-extension://')) {
              return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
  );
});