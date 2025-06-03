import { defineStore } from "pinia";
import axios from "@/axios";
import { ref } from "vue";

export const useStore = defineStore("main", {
    state: () => ({
        user: ref(JSON.parse(localStorage.getItem("user") || "null")),
        tasks: [],
        goals: [],
    }),

    actions: {
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
    },
});
