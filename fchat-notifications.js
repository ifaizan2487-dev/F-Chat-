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

})();