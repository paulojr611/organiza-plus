import axios from "@/axios";

export function scheduleNotification(reminder) {
    if (Notification.permission !== "granted") return;

    if (reminder.notified) return;

    const when = new Date(reminder.remind_at).getTime() - Date.now();

    if (when <= 0) {
        fireNotification(reminder);
        return;
    }

    setTimeout(() => {
        fireNotification(reminder);
    }, when);
}

function fireNotification(reminder) {
    new Notification(reminder.title, {
        body: reminder.description  //|| "⏰ Lembrete!",
    });

    axios.post(`/reminders/${reminder.id}/notify`).catch((err) => {
        console.error("Erro ao marcar como notificado:", err);
    });
}
