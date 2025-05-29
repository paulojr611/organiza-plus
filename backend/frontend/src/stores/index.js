import { defineStore } from 'pinia'
import axios from '@/axios'
import {ref} from 'vue'

export const useStore = defineStore('main', {
  state: () => ({
    user: ref(JSON.parse(localStorage.getItem('user') || 'null')),     
    tasks: [],    
    goals: [],
  }),

  actions: {
    async fetchTasks() {
      try {
        const response = await axios.get('/tasks')
        this.tasks = response.data
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error)
      }
    }
  }
})
