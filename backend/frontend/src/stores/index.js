import { defineStore } from "pinia";
import axios from "@/axios";
import { ref } from "vue";
import { formatLocalDatetime } from "@/utils/date";
import { scheduleNotification } from "@/utils/notification";

export const useStore = defineStore("main", {
    state: () => ({
        user: ref(JSON.parse(localStorage.getItem("user") || "null")),
        tasks: [],
        goals: [],
        reminders: [],
    }),

    actions: {
        async createTask({ form, errors, loading, selectedDays, router }) {
            errors.title = "";
            errors.due_dates = "";

            if (!form.title.trim()) {
                errors.title = "O título é obrigatório";
                return;
            }

            if (form.due_dates.length === 0) {
                errors.due_dates = "Selecione pelo menos uma data";
                return;
            }

            loading.value = true;

            try {
                const token = localStorage.getItem("api_token");
                const formattedDates = form.due_dates.map((d) =>
                    new Date(d).toISOString().slice(0, 10)
                );

                await axios.post(
                    "/tasks",
                    {
                        title: form.title,
                        due_date: formattedDates,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

               
                form.title = "";
                form.due_dates = [];
                selectedDays.value = [];
                router.push({ name: "Dashboard" });
            } catch (err) {
                if (err.response?.status === 422 && err.response.data.errors) {
                    const respErrors = err.response.data.errors;
                    errors.title = respErrors.title?.[0] || "";
                    errors.due_dates = respErrors.due_dates?.[0] || "";
                } else {
                    alert(
                        err.response?.data?.message || "Erro ao criar tarefa"
                    );
                }
            } finally {
                loading.value = false;
            }
        },

        async fetchTasks() {
            try {
                const response = await axios.get("/tasks");
                this.tasks = response.data;
            } catch (error) {
                console.error("Erro ao buscar tarefas:", error);
            }
        },
        async updateTask(taskId, data) {
            try {
                await axios.put(`/tasks/${taskId}`, data);
                const task = this.tasks.find((t) => t.id === taskId);
                if (task) {
                    Object.assign(task, data);
                }
            } catch (error) {
                console.error("Erro ao atualizar tarefa:", error);
                throw error;
            }
        },
        async updateTaskStatus(taskId, status) {
            await axios.put(`/tasks/${taskId}/status`, { status });
            this.fetchTasks();
        },
        async deleteTask(taskId) {
            await axios.delete(`/tasks/${taskId}`);
            this.fetchTasks();
        },

        async logout() {
            try {
                await axios.post("/logout");
                this.user = null;
                this.tasks = [];
                localStorage.removeItem("token");
                axios.defaults.headers.common["Authorization"] = null;
            } catch (error) {
                console.error("Erro ao fazer logout:", error);
                throw error;
            }
        },

        async fetchGoals() {
            const response = await axios.get("/goals");
            this.goals = response.data;
        },
        async updateGoal(goalId, payload) {
            try {
                if (!("completed" in payload)) {
                    const goal = this.goals.find((g) => g.id === goalId);
                    if (goal) {
                        payload.completed = goal.completed;
                    }
                }

                await axios.put(`/goals/${goalId}`, payload);
            } catch (error) {
                console.error("Erro ao atualizar meta:", error);
                if (error.response && error.response.data) {
                    console.error("Detalhes do erro:", error.response.data);
                }
                throw error;
            }
        },
        async createGoal(goalData) {
            const response = await axios.post("/goals", goalData);
            this.goals.push(response.data);
        },
        async deleteGoal(goalId) {
            try {
                await axios.delete(`/goals/${goalId}`);
            } catch (error) {
                console.error("Erro ao deletar meta:", error);
                throw error;
            }
        },

        async createReminder({
            form,
            errors,
            selectedDate,
            time,
            loading,
            router,
        }) {
            errors.title = "";
            errors.remind_at = "";

            if (!form.title.trim()) {
                errors.title = "O título é obrigatório";
                return;
            }
            if (!selectedDate.value || !time.value) {
                errors.remind_at = "Data e horário são obrigatórios.";
                return;
            }

            loading.value = true;
            try {
                const [hours, minutes] = time.value.split(":").map(Number);
                const remindAtDate = new Date(selectedDate.value);
                remindAtDate.setHours(hours, minutes, 0, 0);

                const formattedRemindAt = formatLocalDatetime(remindAtDate);
                const token = localStorage.getItem("api_token");
                const response = await axios.post(
                    "/reminders",
                    {
                        title: form.title,
                        description: form.description,
                        remind_at: formattedRemindAt,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const reminder = response.data;

                if (Notification.permission === "granted") {
                    new Notification("Lembrete criado!", {
                        body: reminder.title,
                    });
                }

                scheduleNotification({
                    ...reminder,
                    remind_at: remindAtDate,
                });

                form.title = "";
                form.description = "";
                selectedDate.value = null;
                time.value = "12:00";
                router.push({ name: "Dashboard" });

                return reminder;
            } catch (e) {
                if (e.response?.data?.errors) {
                    Object.assign(errors, e.response.data.errors);
                } else {
                    alert("Erro ao criar lembrete.");
                }
                throw e;
            } finally {
                loading.value = false;
            }
        },

        async fetchReminders() {
            const token = localStorage.getItem("api_token");
            const { data } = await axios.get("/reminders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            this.reminders = data.map((r) => ({
                ...r,
                // antes: new Date(r.remind_at.replace(/Z$/, "")),
                // agora:
                remind_at: new Date(r.remind_at),
            }));
        },

        async updateReminder(id, payload) {
            try {
                const token = localStorage.getItem("api_token");
                const toSend = {
                    ...payload,
                    remind_at:
                        typeof payload.remind_at === "string"
                            ? payload.remind_at.replace(/Z$/, "")
                            : payload.remind_at.toISOString().replace(/Z$/, ""),
                };

                await axios.put(`/reminders/${id}`, toSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await this.fetchReminders();
                this.reminders.forEach(scheduleNotification);
            } catch (err) {
                console.error("Erro ao atualizar lembrete:", err);
            }
        },

        async deleteReminder(id) {
            try {
                const token = localStorage.getItem("api_token");
                await axios.delete(`/reminders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await this.fetchReminders();
                this.reminders.forEach(scheduleNotification);
            } catch (err) {
                console.error("Erro ao excluir lembrete:", err);
            }
        },
    },
});
