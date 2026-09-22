// ==========================================
// F-CHAT NOTIFICATIONS
// STEP 7
// ==========================================

(function () {

  "use strict";

  window.fchatNotificationReady = false;
  window.fchatFCMToken = null;

  async function setupFChatNotifications() {

    try {

      if (!("Notification" in window)) {
        console.log("[F-Chat] Notifications not supported.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        console.log("[F-Chat] Service Worker not supported.");
        return;
      }

      if (!window.fchatFirebaseMessaging) {
        console.error("[F-Chat] Firebase Messaging not initialized.");
        return;
      }

      // Ask notification permission
      const permission =
        await Notification.requestPermission();

      console.log(
        "[F-Chat] Notification permission:",
        permission
      );

      if (permission !== "granted") {
        console.log(
          "[F-Chat] Notification permission denied."
        );
        return;
      }

      // Register Firebase service worker
      const registration =
        await navigator.serviceWorker.register(
          "/F-Chat/firebase-messaging-sw.js"
        );

      console.log(
        "[F-Chat] Service Worker registered:",
        registration.scope
      );

      // Get FCM token
      const token =
        await window.fchatFirebaseMessaging.getToken({
          vapidKey: window.fchatVapidKey,
          serviceWorkerRegistration: registration
        });

      if (!token) {
        console.error(
          "[F-Chat] FCM token not received."
        );
        return;
      }

      window.fchatFCMToken = token;
      window.fchatNotificationReady = true;

      console.log(
        "[F-Chat] FCM token received:",
        token
      );

    } catch (error) {

      console.error(
        "[F-Chat] Notification setup error:",
        error
      );

    }

  }

  window.fchatSetupNotifications =
    setupFChatNotifications;
  // TEMPORARY NOTIFICATION TEST
setTimeout(() => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("[F-Chat] Manual notification permission:", permission);
    });
  }
}, 3000);

// ==========================================
// TEMPORARY NOTIFICATION TEST BUTTON
// ==========================================

const testBtn = document.createElement("button");

testBtn.innerText = "🔔 Test Notification";

testBtn.style.position = "fixed";
testBtn.style.bottom = "20px";
testBtn.style.left = "20px";
testBtn.style.zIndex = "999999";
testBtn.style.padding = "12px 18px";
testBtn.style.border = "none";
testBtn.style.borderRadius = "10px";
testBtn.style.background = "#25D366";
testBtn.style.color = "#fff";
testBtn.style.fontSize = "15px";

testBtn.onclick = async function () {

  if (!("Notification" in window)) {
    alert("Notifications supported nahi hain.");
    return;
  }

  const permission =
    await Notification.requestPermission();

  alert("Permission: " + permission);

  if (permission === "granted") {

    new Notification("📞 F-Chat Test", {
      body: "Notification system working!",
      icon: "/F-Chat/favicon.png"
    });

  }

};

document.body.appendChild(testBtn);
})();