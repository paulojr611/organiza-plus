<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
      <h2 class="text-2xl font-semibold text-center mb-6">Redefinir Senha</h2>

      <form @submit.prevent="submit" class="space-y-4">
        <input type="hidden" v-model="form.token" />

        <div>
          <label class="block text-sm font-medium mb-1" for="email">E-mail</label>
          <input v-model="form.email" type="email" id="email" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="password">Nova Senha</label>
          <input v-model="form.password" type="password" id="password" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="password_confirmation">Confirme a Senha</label>
          <input v-model="form.password_confirmation" type="password" id="password_confirmation" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <button type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Redefinir Senha</button>

        <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
        <p v-if="success" class="text-green-600 text-sm mt-2">{{ success }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const form = ref({
  email: '',
  password: '',
  password_confirmation: '',
  token: ''
})

const error = ref('')
const success = ref('')

onMounted(() => {
  form.value.token = route.query.token || ''
})

const submit = async () => {
  error.value = ''
  success.value = ''
  try {
    const response = await axios.post('/api/reset-password', form.value)
    success.value = 'Senha redefinida com sucesso!'
  } catch (err) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Erro ao redefinir a senha.'
    }
  }
}
</script>
