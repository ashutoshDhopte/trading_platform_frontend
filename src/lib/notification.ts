


export function showNotificationUtil(title: string, options: NotificationOptions) {
  if (!("Notification" in window)) {
    return; // Browser doesn't support notifications
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}