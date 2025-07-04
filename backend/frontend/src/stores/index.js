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

                const payload = {
                    title: form.title,
                    due_date: formattedDates,
                    subtasks: form.subtasks.map((s) => ({
                        title: s.title,
                    })),
                };

                await axios.post("/tasks", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                form.title = "";
                form.due_dates = [];
                selectedDays.value = [];
                form.subtasks = []; 
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
        async fetchTasksByDate(date) {
            const { data } = await axios.get("/tasks", {
                params: { date },
            });
            this.tasks = data;
        },
        async updateDate(id, newDate) {
            await axios.put(`/tasks/${id}`, {
                due_date: newDate,
            });

            const idx = this.tasks.findIndex((t) => t.id === id);
            if (idx !== -1) {
                this.tasks[idx] = {
                    ...this.tasks[idx],
                    due_date: newDate,
                };
            }
        },
        async updateTaskNotes(taskId, notes) {
            const resp = await axios.put(`/tasks/${taskId}/notes`, {
                notes,
            });
            const idx = this.tasks.findIndex((t) => t.id === taskId);
            if (idx !== -1) {
                this.tasks[idx].notes = resp.data.task.notes;
            }
            return resp.data.task;
        },

        async logout() {
            try {
                await axios.post("/logout");
            } catch (error) {
                console.error("Erro no request de logout:", error);
            } finally {
                this.user = null;
                this.tasks = [];
                this.goals = [];
                this.reminders = [];

                localStorage.removeItem("api_token");
                localStorage.removeItem("user");

                delete axios.defaults.headers.common["Authorization"];

                this.router
                    ? this.router.push({ path: "/" })
                    : (window.location.href = "/");
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
            const { data } = await axios.get("/reminders");
            this.reminders = data.map((r) => ({
                ...r,
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

        async fetchSubtasksByDate(dateStr) {
            this.loading = true;
            this.error = null;
            try {
                const token = localStorage.getItem("api_token");
                const { data } = await axios.get(`/subtasks?date=${dateStr}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                this.subtasks = data;
            } catch (err) {
                console.error("Erro ao carregar subtarefas:", err);
                this.error = err;
            } finally {
                this.loading = false;
            }
        },

        async updateSubtaskStatus(subtaskId, status) {
            const token = localStorage.getItem("api_token");
            await axios.put(
                `/subtasks/${subtaskId}`,
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        },

        async deleteSubtask(id) {
            try {
                const token = localStorage.getItem("api_token");
                await axios.delete(`/subtasks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                this.subtasks = this.subtasks.filter((s) => s.id !== id);
            } catch (err) {
                console.error("Erro ao deletar subtarefa:", err);
                throw err;
            }
        },
    },
});
