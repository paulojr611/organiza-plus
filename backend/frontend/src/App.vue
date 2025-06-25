<template>
  <div class="flex flex-col h-screen">
    <Navbar v-if="!isAuthPage" />

    <div class="flex flex-1 min-h-0">
      <Sidebar v-if="!isAuthPage" />

      <template v-if="isAuthPage">
        <RouterView class="flex-1 min-h-0 overflow-auto" />
      </template>

      <main
        v-else
        class="flex-1 min-h-0 bg-gray-100 text-black overflow-auto p-4"
      >
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import { computed } from 'vue'

axios.defaults.baseURL = 'http://localhost:8000'

//axios.defaults.baseURL = 'https://organizamais.com'

const route = useRoute()

// Rotas de autenticação
const authPages = ['/', '/cadastro', '/ResetSenha', '/NaoEncontrada', '/login']

const isAuthPage = computed(() => {
  const isMetaPublic = route.meta.layout === 'public'
  const isPathInAuthPages = authPages.includes(route.path)
  return isMetaPublic || isPathInAuthPages
})
</script>
