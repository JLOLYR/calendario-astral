// firebase-messaging-sw-v2.js
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Vuelve a pegar tu configuración de Firebase aquí
const firebaseConfig = {
    apiKey: "AIzaSyAEp97rBImklvm2M0e4yQ0XVO0OQ5LbENg",
    authDomain: "calendario-astral-popup.firebaseapp.com",
    projectId: "calendario-astral-popup",
    storageBucket: "calendario-astral-popup.firebasestorage.app",
    messagingSenderId: "1010299837934",
    appId: "1:1010299837934:web:8ace892d1168d47964c2ff",
    measurementId: "G-ZGW3BLK1W2"
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();