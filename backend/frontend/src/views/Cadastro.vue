<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-6">Cadastro</h2>
      <form @submit.prevent="handleRegister">
        <!-- Nome -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Nome</label>
          <input
            v-model="form.name"
            maxlength = '50'
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Seu nome completo"
          />
        </div>

        <!-- E-mail -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="exemplo@dominio.com"
          />
        </div>

        <!-- Senha -->
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Senha</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              @keydown="checkCapsLock"
              @keyup="checkCapsLock"
              @focus="checkCapsLock"
              @blur="capsLockWarning = false"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 pr-10"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center px-2 text-gray-500 hover:text-gray-700"
            >
              <EyeIcon v-if="!showPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
          <p
            v-if="capsLockWarning"
            class="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1"
          >
            Atenção: Caps Lock está ligado!
          </p>
        </div>

        <!-- Botão -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
        >
          <span
            v-if="loading"
            class="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent mr-2"
          ></span>
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>

      <!-- Link para login -->
      <p class="text-center text-sm text-gray-600 mt-4">
        Já tem conta?
        <router-link to="/login" class="text-blue-500 hover:underline">Faça login</router-link>
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

const router = useRouter()
const toast = useToast()
const store = useStore()

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
const capsLockWarning = ref(false)

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email)
}

function checkCapsLock(event) {
  capsLockWarning.value = event.getModifierState
    ? event.getModifierState('CapsLock')
    : false
}

async function handleRegister() {
  // Validações rápidas
  if (!form.name.trim()) {
    toast.warning('Informe seu nome.')
    return
  }
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
    const { data } = await axios.post('/api/register', form)

    localStorage.setItem('api_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    store.user = data.user
    store.token = data.token

    toast.success('Cadastro realizado com sucesso!')

    router.push({ name: 'Dashboard' })
  } catch (err) {
    console.error('Erro no cadastro:', err)
    toast.error(err.response?.data.message || 'Falha ao cadastrar.')
  } finally {
    loading.value = false
  }
}
</script>
