// ==========================================
// F-CHAT NOTIFICATIONS
// AUTO RESTORE VERSION
// ==========================================

(function () {
  "use strict";

  window.fchatNotificationReady = false;
  window.fchatFCMToken = null;

  async function setupFChatNotifications() {
    try {
      if (!("Notification" in window)) {
        console.log("[F-Chat] Notifications not supported.");
        return false;
      }

      if (!("serviceWorker" in navigator)) {
        console.log("[F-Chat] Service Worker not supported.");
        return false;
      }

      if (!window.fchatFirebaseMessaging) {
        console.error(
          "[F-Chat] Firebase Messaging not initialized."
        );
        return false;
      }

      console.log(
        "[F-Chat] Notification permission:",
        Notification.permission
      );

      // Permission abhi granted nahi hai
      if (Notification.permission !== "granted") {
        console.log(
          "[F-Chat] Notification permission not granted."
        );
        return false;
      }

      // Service Worker register / restore
      const registration =
        await navigator.serviceWorker.register(
          "/F-Chat/firebase-messaging-sw.js"
        );

      console.log(
        "[F-Chat] Service Worker:",
        registration.scope
      );

      // Existing FCM token restore karo
      const token =
        await window.fchatFirebaseMessaging.getToken({
          vapidKey: window.fchatVapidKey,
          serviceWorkerRegistration: registration
        });

      if (!token) {
        console.error(
          "[F-Chat] FCM token not available."
        );
        return false;
      }

      window.fchatFCMToken = token;
      window.fchatNotificationReady = true;

      console.log(
        "[F-Chat] FCM token restored successfully."
      );

      updateNotificationButton();

      return true;

    } catch (error) {
      console.error(
        "[F-Chat] Notification setup error:",
        error
      );

      return false;
    }
  }


  async function enableFChatNotifications() {
    try {
      if (!("Notification" in window)) {
        alert("Notifications supported nahi hain.");
        return;
      }

      const permission =
        await Notification.requestPermission();

      console.log(
        "[F-Chat] Permission result:",
        permission
      );

      if (permission === "granted") {

        const success =
          await setupFChatNotifications();

        if (success) {
          alert(
            "✅ F-Chat notifications enabled!"
          );
        } else {
          alert(
            "⚠️ Permission granted hai, lekin FCM setup complete nahi hua."
          );
        }

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
        "Notification error: " +
        error.message
      );
    }
  }


  function updateNotificationButton() {

    const btn =
      document.getElementById(
        "fchatEnableNotificationsBtn"
      );

    if (!btn) return;

    if (
      Notification.permission === "granted" &&
      window.fchatNotificationReady === true
    ) {

      btn.innerText =
        "✅ Notifications Enabled";

      btn.disabled = true;
      btn.style.opacity = "0.7";
      btn.style.cursor = "default";

    } else {

      btn.innerText =
        "🔔 Enable Notifications";

      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  }


  function showFChatNotificationButton() {

    let btn =
      document.getElementById(
        "fchatEnableNotificationsBtn"
      );

    // Agar button already hai
    if (btn) {

      updateNotificationButton();

      return;
    }

    btn = document.createElement("button");

    btn.id =
      "fchatEnableNotificationsBtn";

    btn.innerText =
      "🔔 Enable Notifications";

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
    btn.style.boxShadow =
      "0 4px 12px rgba(0,0,0,0.3)";

    btn.onclick = async function () {

      btn.disabled = true;

      await enableFChatNotifications();

      updateNotificationButton();
    };

    document.body.appendChild(btn);

    // Startup par existing permission/token check
    setupFChatNotifications();
  }


  // Expose functions
  window.fchatShowNotificationButton =
    showFChatNotificationButton;

  window.fchatSetupNotifications =
    setupFChatNotifications;

  window.fchatEnableNotifications =
    enableFChatNotifications;


  // Auto restore on page open/reload
  window.addEventListener(
    "load",
    function () {

      setTimeout(function () {

        if (
          Notification.permission ===
          "granted"
        ) {

          setupFChatNotifications();

        }

      }, 500);

    }
  );

})();