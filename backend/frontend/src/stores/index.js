// src/stores/index.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useStore = defineStore('main', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const tasks = ref([])
  const goals = ref([])

  const todayTasks = () => {
    const today = new Date()
    return tasks.value.filter(t => {
      const d = new Date(t.due_date)
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      )
    })
  }

  async function fetchTasks() {
    try {
      const { data } = await axios.get('/api/tasks')
      tasks.value = data
    } catch (e) {
      console.error('Erro ao buscar tarefas:', e)
    }
  }

  async function addTask(task) {
    try {
      const { data } = await axios.post('/api/tasks', task)
      tasks.value.push(data)
    } catch (e) {
      console.error('Erro ao criar tarefa:', e)
    }
  }

  async function completeTask(id) {
    try {
      const { data } = await axios.put(`/api/tasks/${id}`, { completed: true })
      tasks.value = tasks.value.map(t => t.id === id ? data : t)
    } catch (e) {
      console.error('Erro ao completar tarefa:', e)
    }
  }

  return {
    user,
    tasks,
    goals,
    todayTasks,
    fetchTasks,
    addTask,
    completeTask,
  }
})
