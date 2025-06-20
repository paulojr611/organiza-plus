<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 mb-2">E-mail</label>
          <input id="email" v-model="form.email" type="email" required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <!-- Senha com toggle de visibilidade -->
        <div class="mb-4">
          <label for="password" class="block text-gray-700 mb-2">Senha</label>

          <!-- wrapper relativo SÓ para input + botão -->
          <div class="relative">
            <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" required
              @keydown="checkCapsLock" @keyup="checkCapsLock" @focus="checkCapsLock" @blur="capsLockWarning = false"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10" />

            <button type="button" @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center px-2 text-gray-500 hover:text-gray-700">
              <EyeIcon v-if="!showPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>

          <!-- CapsLock warning pode ficar aqui mesmo -->
          <p v-if="capsLockWarning" class="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1">
            Atenção: Caps Lock está ligado!
          </p>
        </div>




        <!-- Botão de submit -->
        <button type="submit" :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center mt-4">
          <span v-if="loading"
            class="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <!-- Links -->
      <p class="text-center text-sm text-gray-600 mt-4">
        <router-link to="/ResetSenha" class="text-blue-500 hover:underline">Esqueceu sua senha?</router-link>
      </p>
      <p class="text-center text-sm text-gray-600 mt-2">
        Não tem conta?
        <router-link to="/cadastro" class="text-blue-500 hover:underline">Cadastre-se</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useStore } from '@/stores'

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)
const capsLockWarning = ref(false)
const toast = useToast()
const router = useRouter()
const store = useStore()         

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email)
}

function checkCapsLock(event) {
  capsLockWarning.value = event.getModifierState
    ? event.getModifierState('CapsLock')
    : false
}

async function handleSubmit() {
  if (!isValidEmail(form.email)) {
    toast.warning('Digite um e‑mail válido.')
    return
  }
  if (form.password.length < 6) {
    toast.warning('A senha precisa ter ao menos 6 caracteres.')
    return
  }

  loading.value = true
  try {
    const { data } = await axios.post('/api/login', {
      email: form.email,
      password: form.password
    })

    store.user = data.user

    localStorage.setItem('api_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    toast.success('Bem‑vindo de volta!')
    router.push({ name: 'Dashboard' })
  } catch (err) {
    toast.error(err.response?.data.message || 'Falha no login')
  } finally {
    loading.value = false
  }
}
</script>
