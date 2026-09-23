// ==========================================
// F-CHAT NOTIFICATIONS
// FINAL FIX
// ==========================================

(function () {
  "use strict";

  window.fchatNotificationReady = false;
  window.fchatFCMToken = null;

  // ==========================================
  // UPDATE BUTTON
  // ==========================================

  function updateNotificationButton() {

    const btn = document.getElementById(
      "fchatEnableNotificationsBtn"
    );

    if (!btn) return;

    // Permission granted = UI enabled
    if (
      "Notification" in window &&
      Notification.permission === "granted"
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


  // ==========================================
  // FCM SETUP
  // ==========================================

  async function setupFChatNotifications() {

    try {

      console.log(
        "[F-Chat] Starting FCM setup..."
      );

      // Notification support
      if (!("Notification" in window)) {

        console.error(
          "[F-Chat] Notification API not supported."
        );

        return false;
      }


      // Service Worker support
      if (!("serviceWorker" in navigator)) {

        console.error(
          "[F-Chat] Service Worker not supported."
        );

        return false;
      }


      // Firebase Messaging check
      if (!window.fchatFirebaseMessaging) {

        console.error(
          "[F-Chat] Firebase Messaging not initialized."
        );

        return false;
      }


      console.log(
        "[F-Chat] Permission:",
        Notification.permission
      );


      // Permission must be granted
      if (Notification.permission !== "granted") {

        updateNotificationButton();

        return false;
      }


      // ==========================================
      // REGISTER FCM SERVICE WORKER
      // ==========================================

      const registration =
        await navigator.serviceWorker.register(
          "/F-Chat/firebase-messaging-sw.js"
        );

      console.log(
        "[F-Chat] Service Worker registered:",
        registration.scope
      );


      // Wait until service worker is ready
      const readyRegistration =
        await navigator.serviceWorker.ready;

      console.log(
        "[F-Chat] Service Worker ready."
      );


      // ==========================================
      // GET FCM TOKEN
      // ==========================================

      const token =
        await window.fchatFirebaseMessaging.getToken({
          vapidKey: window.fchatVapidKey,
          serviceWorkerRegistration:
            readyRegistration
        });


      if (!token) {

        console.error(
          "[F-Chat] FCM token was empty."
        );

        window.fchatNotificationReady = false;

        // Permission is still granted
        updateNotificationButton();

        return false;
      }


      // ==========================================
      // TOKEN SUCCESS
      // ==========================================

      window.fchatFCMToken = token;

      window.fchatNotificationReady = true;

      console.log(
        "[F-Chat] ✅ FCM token received."
      );

      console.log(
        "[F-Chat] FCM setup complete."
      );

      updateNotificationButton();

      return true;

    } catch (error) {

      console.error(
        "[F-Chat] ❌ FCM setup error:",
        error
      );

      window.fchatNotificationReady = false;

      updateNotificationButton();

      return false;
    }
  }


  // ==========================================
  // ENABLE NOTIFICATIONS
  // ==========================================

  async function enableFChatNotifications() {

    try {

      if (!("Notification" in window)) {

        alert(
          "Notifications supported nahi hain."
        );

        return;
      }


      console.log(
        "[F-Chat] Requesting notification permission..."
      );


      const permission =
        await Notification.requestPermission();


      console.log(
        "[F-Chat] Permission result:",
        permission
      );


      if (permission === "granted") {

        // Immediately update UI
        updateNotificationButton();


        const success =
          await setupFChatNotifications();


        if (success) {

          alert(
            "✅ F-Chat notifications enabled!"
          );

        } else {

          alert(
            "⚠️ Permission granted hai, lekin FCM token setup nahi hua. Console me FCM error check karo."
          );
        }

        return;
      }


      if (permission === "denied") {

        alert(
          "❌ Notification permission denied hai. Chrome site settings me notifications Allow karo."
        );

        updateNotificationButton();

        return;
      }


      alert(
        "Notification permission abhi allow nahi hui."
      );

      updateNotificationButton();

    } catch (error) {

      console.error(
        "[F-Chat] Notification error:",
        error
      );

      alert(
        "❌ Notification error: " +
        error.message
      );

      updateNotificationButton();
    }
  }


  // ==========================================
  // SHOW BUTTON
  // ==========================================

  function showFChatNotificationButton() {

    let btn = document.getElementById(
      "fchatEnableNotificationsBtn"
    );


    // Button already exists
    if (btn) {

      updateNotificationButton();

      return;
    }


    // Create button
    btn = document.createElement("button");

    btn.id =
      "fchatEnableNotificationsBtn";

    btn.innerText =
      "🔔 Enable Notifications";


    // ==========================================
    // BUTTON STYLE
    // ==========================================

    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.left = "20px";
    btn.style.zIndex = "999999";

    btn.style.padding =
      "12px 18px";

    btn.style.border =
      "none";

    btn.style.borderRadius =
      "12px";

    btn.style.background =
      "#25D366";

    btn.style.color =
      "#fff";

    btn.style.fontSize =
      "15px";

    btn.style.fontWeight =
      "600";

    btn.style.boxShadow =
      "0 4px 12px rgba(0,0,0,0.3)";


    // ==========================================
    // BUTTON CLICK
    // ==========================================

    btn.onclick = async function () {

      if (btn.disabled) return;

      btn.disabled = true;

      await enableFChatNotifications();

      updateNotificationButton();
    };


    document.body.appendChild(btn);


    // ==========================================
    // RESTORE STATE
    // ==========================================

    updateNotificationButton();


    // If permission already granted,
    // silently restore FCM
    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {

      setupFChatNotifications();
    }
  }


  // ==========================================
  // EXPOSE FUNCTIONS
  // ==========================================

  window.fchatShowNotificationButton =
    showFChatNotificationButton;

  window.fchatSetupNotifications =
    setupFChatNotifications;

  window.fchatEnableNotifications =
    enableFChatNotifications;


  // ==========================================
  // AUTO START
  // ==========================================

  window.addEventListener(
    "load",
    function () {

      setTimeout(function () {

        showFChatNotificationButton();

      }, 500);

    }
  );

})();