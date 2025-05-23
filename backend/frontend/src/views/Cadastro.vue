<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-6">Cadastro</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Nome</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">E-mail</label>
          <input v-model="form.email" type="email" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Senha</label>
          <input v-model="form.password" type="password" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>
      <p class="text-center text-sm text-gray-600 mt-4">
        Já tem conta?
        <a href="/" class="text-blue-500 hover:underline">Faça login</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'

const form = reactive({
  name: '',
  email: '',
  password: ''
})
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  try {
    await axios.post('/api/register', form)
    alert('Cadastro realizado com sucesso!')
    window.location.href = '/'
  } catch (error) {
    alert(error.response?.data.message || 'Erro ao cadastrar')
  } finally {
    loading.value = false
  }
}
</script>
