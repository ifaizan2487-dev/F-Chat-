// ==========================================
// F-CHAT NOTIFICATIONS
// CLEAN VERSION
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
        console.error(
          "[F-Chat] Firebase Messaging not initialized."
        );
        return;
      }

      console.log(
        "[F-Chat] Current notification permission:",
        Notification.permission
      );

      // IMPORTANT:
      // Permission request should NOT happen automatically here.
      // It must happen from a user action.

      if (Notification.permission !== "granted") {
        console.log(
          "[F-Chat] Notification permission not granted yet."
        );
        return;
      }

      // Register service worker
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

  // ==========================================
  // USER-ACTION NOTIFICATION ENABLE
  // ==========================================

  async function enableFChatNotifications() {

    try {

      if (!("Notification" in window)) {
        alert("Notifications supported nahi hain.");
        return;
      }

      console.log(
        "[F-Chat] Permission before request:",
        Notification.permission
      );

      const permission =
        await Notification.requestPermission();

      console.log(
        "[F-Chat] Permission result:",
        permission
      );

      if (permission === "granted") {

        await setupFChatNotifications();

        alert("✅ F-Chat notifications enabled!");

      } else if (permission === "denied") {

        alert(
          "❌ Notification permission denied hai. " +
          "Chrome site settings se notification Allow karo."
        );

      } else {

        alert(
          "Notification permission abhi allow nahi hui."
        );

      }

    } catch (error) {

      console.error(
        "[F-Chat] Permission request error:",
        error
      );

      alert(
        "Notification error: " + error.message
      );

    }

  }
  // ==========================================
// F-CHAT ENABLE NOTIFICATIONS BUTTON
// ==========================================

function showFChatNotificationButton() {

  // Already exists
  if (document.getElementById("fchatEnableNotificationsBtn")) {
    return;
  }

  const btn = document.createElement("button");

  btn.id = "fchatEnableNotificationsBtn";
  btn.innerText = "🔔 Enable Notifications";

  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.left = "20px";
  btn.style.zIndex = "999999";
  btn.style.padding = "12px 18px";
  btn.style.border = "none";
  btn.style.borderRadius = "12px";
  btn.style.background = "#25D366";
  btn.style.color = "#fff";
  btn.style.fontSize = "15px";
  btn.style.fontWeight = "600";
  btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

  btn.onclick = async function () {

    await enableFChatNotifications();

    if (Notification.permission === "granted") {
      btn.innerText = "✅ Notifications Enabled";
      btn.disabled = true;
      btn.style.opacity = "0.7";
    }

  };

  document.body.appendChild(btn);
}

window.fchatShowNotificationButton =
  showFChatNotificationButton;

  window.fchatSetupNotifications =
    setupFChatNotifications;

  window.fchatEnableNotifications =
    enableFChatNotifications;

})();