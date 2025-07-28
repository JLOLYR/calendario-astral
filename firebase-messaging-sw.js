// firebase-messaging-sw.js
// Importa las librerías de Firebase
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Vuelve a pegar tu configuración de Firebase aquí
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Obtiene la instancia de mensajería
const messaging = firebase.messaging();

// Manejador para cuando llega un mensaje con la app en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en segundo plano: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './assets/icons/icon-192x192.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});