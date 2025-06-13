<template>
  <div class="relative bg-gradient-to-br from-purple-600 to-indigo-600 min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Decorative shapes -->
    <div class="hidden lg:block absolute -top-32 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply opacity-30 animate-blob"></div>
    <div class="hidden lg:block absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-2000"></div>

    <div class="relative z-10 container mx-auto px-6 py-16 flex flex-col-reverse lg:flex-row items-center">
      <!-- Text Content -->
      <div class="w-full lg:w-1/2 text-center lg:text-left">
        <h1 class="text-white text-5xl lg:text-6xl font-extrabold leading-tight">
          Bem-vindo ao <span class="text-yellow-300">Organiza+</span>
        </h1>
        <p class="mt-6 text-lg lg:text-xl text-purple-100">
          Planeje suas tarefas, defina metas ambiciosas e nunca perca um lembrete importante. 
          Tudo num só lugar, de forma simples e poderosa.
        </p>
        <div class="mt-10 flex justify-center lg:justify-start space-x-4">
          <router-link to="/login" class="px-8 py-3 bg-yellow-300 text-purple-800 font-semibold rounded-lg shadow-lg hover:bg-yellow-400 transition">
            Entrar
          </router-link>
          <router-link to="/cadastro" class="px-8 py-3 border-2 border-yellow-300 text-yellow-300 font-semibold rounded-lg hover:bg-yellow-300 hover:text-purple-800 transition">
            Cadastrar
          </router-link>
        </div>
      </div>

      <!-- Icon Illustration -->
      <div class="w-full lg:w-1/2 mb-10 lg:mb-0 flex justify-center">
        <!-- Usando ícones do Heroicons para ilustração simplificada -->
        <div class="bg-white/10 backdrop-blur-md border-none p-10 rounded-2xl flex flex-col items-center justify-center shadow-lg">
          <ClipboardDocumentListIcon class="w-24 h-24 text-yellow-300 mb-4 animate-bounce" />
          <CalendarDaysIcon class="w-16 h-16 text-purple-100 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClipboardDocumentListIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
</script>

<style scoped>
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-blob {
  animation: blob 8s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
