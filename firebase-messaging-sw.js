// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyCO_E3eIgX-4Nhue10W5Sb6WmmwxhPB7d4",
  authDomain: "galaxyworldwideshipping-18a12.firebaseapp.com",
  projectId: "galaxyworldwideshipping-18a12",
  storageBucket: "galaxyworldwideshipping-18a12.appspot.com",
  messagingSenderId: "188949712933",
  appId: "1:188949712933:web:bac2456c404a83d14a6fcc",
  measurementId: "G-TR1HSHPDRF"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});