<script setup>
import { sidebar } from '@/stores/menuSidebar'
import { ref } from 'vue'
import { useStore } from '@/stores'
import { Bars3Icon, XMarkIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/vue/24/outline'

const menuStore = sidebar()
const store = useStore()
const isOpen = ref(false)

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const allowAccess = () => {
  sessionStorage.setItem('canAccessPage', 'true')
  isOpen.value = false 
}

const logout = async () => {
  try {
    await store.logout()
    localStorage.removeItem('token')
    isOpen.value = false 
    window.location.href = '/'
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>

<template>

  <div class="fixed top-2 left-4 z-[1000]">
    <button
      @click="toggleSidebar"
      class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
    >
      <component :is="isOpen ? XMarkIcon : Bars3Icon" class="w-6 h-6 text-indigo-600" />
    </button>
  </div>

  <nav
    :class="[
      'fixed top-0 left-0 z-[999] h-full w-64 flex flex-col justify-between bg-indigo-700 text-white transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div>
      <div class="flex items-center justify-center py-4 text-xl font-bold tracking-tight">
        Organiza<span class="text-yellow-300">+</span>
      </div>

      <div class="flex flex-col px-2">
        <router-link
          v-for="item in menuStore.menuItems"
          :key="item.label"
          :to="item.route"
          @click="allowAccess"
          class="flex items-center gap-2 p-2 rounded hover:bg-black/20 transition"
        >
          <component :is="item.icon" class="w-6 text-gray-200" />
          <span class="text-sm">{{ item.label }}</span>
        </router-link>
      </div>
    </div>

    <div class="px-4 py-3 border-t border-white/20">
      <button
        @click="logout"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition"
      >
        <ArrowLeftEndOnRectangleIcon class="w-5 h-5" />
        Sair
      </button>
    </div>
  </nav>
</template>
