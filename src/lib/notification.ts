import { useUser } from "@/components/UserContext";

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    console.log("Permission to receive notifications has already been granted.");
    return;
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Permission to receive notifications was granted.");
        // You could show a confirmation notification here
        new Notification("Notifications Enabled!", {
          body: "You will now receive updates from the trading platform.",
        });
      }
    });
  }
}

export function showNotificationUtil(title: string, options: NotificationOptions) {
  if (!("Notification" in window)) {
    return; // Browser doesn't support notifications
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}