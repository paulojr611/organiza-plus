export function scheduleNotification(reminder) {
  if (Notification.permission !== "granted") return;

  const when = new Date(reminder.remind_at).getTime() - Date.now();
  if (when <= 0) return;  // não agenda lembretes já vencidos

  setTimeout(() => {
    new Notification(reminder.title, {
      body: reminder.description || "⏰ Lembrete!",
    });
  }, when);
}
