// ==========================================
// F-CHAT FIREBASE INITIALIZATION
// ==========================================

(function () {

  "use strict";

  if (!window.fchatFirebaseConfig) {
    console.error("[F-Chat] Firebase config not found.");
    return;
  }

  if (typeof firebase === "undefined") {
    console.error("[F-Chat] Firebase SDK not loaded.");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(window.fchatFirebaseConfig);
  }

  window.fchatFirebaseApp = firebase.app();

  window.fchatFirebaseMessaging =
    firebase.messaging();

  console.log("[F-Chat] Firebase initialized successfully.");

})();