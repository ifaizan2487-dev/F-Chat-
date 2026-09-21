// ==========================================
// F-CHAT FIREBASE MESSAGING SERVICE WORKER
// ==========================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCDOi4dSu19Oaq7ZmIW7_IKYprR5qRtiRg",
  authDomain: "f-chat-50d77.firebaseapp.com",
  projectId: "f-chat-50d77",
  storageBucket: "f-chat-50d77.firebasestorage.app",
  messagingSenderId: "557025373766",
  appId: "1:557025373766:web:093aac470af90195916447",
  measurementId: "G-0M6YRW4105"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log("[F-Chat] Background message:", payload);

  const data = payload.data || {};

  const title =
    data.type === "incoming_call"
      ? "📞 Incoming F-Chat Call"
      : "F-Chat";

  const body =
    data.type === "incoming_call"
      ? `${data.from || "Someone"} is calling you`
      : data.body || "You have a new notification.";

  self.registration.showNotification(title, {
    body: body,
    icon: "/F-Chat/favicon.png",
    badge: "/F-Chat/favicon.png",
    tag: data.callId
      ? `fchat-call-${data.callId}`
      : "fchat-notification",
    requireInteraction: true,
    data: data
  });

});