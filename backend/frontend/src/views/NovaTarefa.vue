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

      <div class="mb-4 flex items-center gap-2">
        <input
          id="recurring"
          type="checkbox"
          v-model="form.is_recurring"
        />
        <label for="recurring" class="font-semibold select-none cursor-pointer">Tarefa recorrente</label>
      </div>

      <div v-if="form.is_recurring" class="mb-4">
        <label class="block mb-1 font-semibold mb-2">Dias da semana</label>
        <div class="flex gap-2">
          <button
            v-for="day in daysOfWeek"
            :key="day.value"
            type="button"
            @click="toggleDay(day.value)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-lg border select-none transition-colors text-sm font-semibold',
              form.recurrence.includes(day.value)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            ]"
          >
            {{ day.label[0] }}
          </button>
        </div>
        <p v-if="errors.recurrence" class="text-red-500 text-sm mt-1">{{ errors.recurrence }}</p>
      </div>

      <div v-else class="mb-4">
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const minDate = ref(today)

const daysOfWeek = [
  { label: 'Segunda', value: 'seg' },
  { label: 'Terça', value: 'ter' },
  { label: 'Quarta', value: 'qua' },
  { label: 'Quinta', value: 'qui' },
  { label: 'Sexta', value: 'sex' },
  { label: 'Sábado', value: 'sab' },
  { label: 'Domingo', value: 'dom' },
]

const form = reactive({
  title: '',
  due_date: '',
  is_recurring: false,
  recurrence: []
})

const errors = reactive({
  title: '',
  due_date: '',
  recurrence: '',
})

const toggleDay = (day) => {
  const index = form.recurrence.indexOf(day)
  if (index === -1) {
    form.recurrence.push(day)
  } else {
    form.recurrence.splice(index, 1)
  }
}

const submitTask = async () => {
  errors.title = ''
  errors.due_date = ''
  errors.recurrence = ''

  if (form.is_recurring && form.recurrence.length === 0) {
    errors.recurrence = 'Selecione ao menos um dia da semana para recorrência'
    return
  }

  loading.value = true
  try {
    const token = localStorage.getItem('api_token')

    await axios.post('/api/tasks', {
      title: form.title,
      due_date: form.is_recurring ? '2025-01-01' : form.due_date,
      recurrence: form.is_recurring ? form.recurrence : null,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    alert('Tarefa criada com sucesso!')

    form.title = ''
    form.due_date = ''
    form.is_recurring = false
    form.recurrence = []

    router.push({ name: 'Dashboard' })
  } catch (err) {
    if (err.response?.status === 422 && err.response.data.errors) {
      const respErrors = err.response.data.errors
      errors.title = respErrors.title?.[0] || ''
      errors.due_date = respErrors.due_date?.[0] || ''
      errors.recurrence = respErrors.recurrence?.[0] || ''
    } else {
      alert(err.response?.data?.message || 'Erro ao criar tarefa')
    }
  } finally {
    loading.value = false
  }
}
</script>
