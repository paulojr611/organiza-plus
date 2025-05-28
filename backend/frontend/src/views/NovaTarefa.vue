<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow mt-10">
    <h1 class="text-2xl font-bold mb-4">Nova Tarefa</h1>
    <form @submit.prevent="submitTask">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Título</label>
        <input
          v-model="form.title"
          class="w-full border p-2 rounded-lg"
          placeholder=""
          required
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Data de Vencimento</label>
        <input
          v-model="form.due_date"
          type="date"
          class="w-full border p-2 rounded-lg"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? 'Salvando...' : 'Salvar Tarefa' }}
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
const form = reactive({
  title: '',
  due_date: ''
})

const submitTask = async () => {
  loading.value = true
  try {
    await axios.post('/api/tasks', {
      title: form.title,
      due_date: form.due_date
    })
    alert('Tarefa criada com sucesso!')
    router.push({ name: 'Dashboard' })
  } catch (err) {
    console.error(err)
    alert(err.response?.data.message || 'Erro ao criar tarefa')
  } finally {
    loading.value = false
  }
}
</script>
