// sw.js CORREGIDO
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Pega aquí el MISMO objeto de configuración que en script.js
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
// --- CAMBIO 1: Hacemos un nombre de caché más específico para evitar conflictos ---
const CACHE_NAME = 'calendario-astral-cache-v1.2'; 

// --- CAMBIO 2: Simplificamos y corregimos las rutas ---
const URLS_TO_CACHE = [
  '/', // Esto representa la carpeta raíz del proyecto
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  // --- Las rutas a tus assets también deben ser relativas ---
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
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
messaging.onBackgroundMessage((payload) => {
    console.log('Push recibido en segundo plano: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || './assets/icons/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- NUEVO: LISTENER PARA CUANDO SE HACE CLIC EN LA NOTIFICACIÓN ---
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Abre la página principal de tu app
    );
});