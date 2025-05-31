<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow mt-10">
    <h1 class="text-2xl font-bold mb-4">Nova Tarefa</h1>
    <form @submit.prevent="submitTask">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Título</label>
        <input
          v-model="form.title"
          class="w-full border p-2 rounded-lg"
          :class="{ 'border-red-500': errors.title }"
          placeholder=""
          required
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-semibold">Data de Vencimento</label>
        <input
          v-model="form.due_date"
          type="date"
          :min="minDate"
          class="w-full border p-2 rounded-lg"
          :class="{ 'border-red-500': errors.due_date }"
          required
        />
        <p v-if="errors.due_date" class="text-red-500 text-sm mt-1">{{ errors.due_date }}</p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
      >
        {{ loading ? 'Salvando...' : 'Salvar Tarefa' }}
        <span v-if="loading" class="animate-spin">⏳</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import { sidebar } from '../stores/menuSidebar'
import { useStore } from '@/stores'

const menuStore = sidebar()
const store = useStore()

const addSide = () => {
  menuStore.addMenuItem({ label: 'Dashboard', icon: ClipboardIcon, route: '/Dashboard' })
}
const removeSide = () => {
  menuStore.removeAllMenuItems()
}
onMounted(() => {
  removeSide()
  addSide()
})

const router = useRouter()
const loading = ref(false)
const form = reactive({
  title: '',
  due_date: ''
})
const errors = reactive({
  title: '',
  due_date: ''
})

const today = new Date().toISOString().split('T')[0]
const minDate = ref(today)

const submitTask = async () => {
  errors.title = ''
  errors.due_date = ''

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  let dataSelecionada

  if (form.due_date.includes('/')) {
    const partes = form.due_date.split('/')
    const dataISO = `${partes[2]}-${partes[1]}-${partes[0]}`
    dataSelecionada = new Date(dataISO)
  } else {
    dataSelecionada = new Date(form.due_date)
  }

  dataSelecionada.setHours(0, 0, 0, 0)

  loading.value = true
  try {
    const token = localStorage.getItem('api_token')

    await axios.post('/api/tasks', {
      title: form.title,
      due_date: form.due_date
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    alert('Tarefa criada com sucesso!')

    // Limpa os campos
    form.title = ''
    form.due_date = ''
    router.push({ name: 'Dashboard' })
  } catch (err) {
    console.error(err)
    if (err.response?.status === 422 && err.response.data.errors) {
      const responseErrors = err.response.data.errors
      errors.title = responseErrors.title?.[0] || ''
      errors.due_date = responseErrors.due_date?.[0] || ''
    } else {
      alert(err.response?.data?.message || 'Erro ao criar tarefa')
    }
  } finally {
    loading.value = false
  }
}
</script>
