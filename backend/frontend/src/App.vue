<template>
  <div class="flex flex-col h-screen">
    <!-- Navbar -->
    <Navbar v-if="!isAuthPage" />

    <!-- Sidebar e Conteúdo -->
    <div class="flex flex-1" :style="isAuthPage ? '' : 'margin-top: 56px;'">
      <!-- Sidebar -->
      <Sidebar v-if="!isAuthPage" />

      <!-- Área Principal -->
      <main class="flex-1 bg-gray-100 text-black overflow-auto p-4">
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

const route = useRoute()

// Checa se é uma rota de autenticação
const authPages = ['/', '/cadastro', '/ResetSenha', '/NaoEncontrada']

const isAuthPage = computed(() => {
  const isMetaPublic = route.meta.layout === 'public'
  const isPathInAuthPages = authPages.includes(route.path)
  return isMetaPublic || isPathInAuthPages
})


</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
