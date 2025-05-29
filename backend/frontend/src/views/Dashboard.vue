<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Olá, {{ user.name }}!</h1>
    </div>

    <!-- Grid de Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-auto">
      <!-- Card: Tarefas do Dia Selecionado -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">
          Tarefas de {{ selectedDay.toLocaleDateString('pt-BR') }}
        </h2>
        <ul class="space-y-2">
          <li v-for="task in todayTasks" :key="task.id" class="flex justify-between">
            <span>{{ task.title }}</span>
            <button @click="complete(task)" class="text-green-500">✔️</button>
          </li>
          <li v-if="!todayTasks.length" class="text-gray-500">Nenhuma tarefa.</li>
        </ul>
      </div>

      <!-- Card: Calendário -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">Calendário</h2>
        <vc-calendar
          is-expanded
          :attributes="calendarAttributes"
          @dayclick="goToDate"
        />
      </div>

      <!-- Card: Metas -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">Progresso das Metas</h2>
        <div v-for="goal in goals" :key="goal.id" class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>{{ goal.title }}</span>
            <span>{{ goal.completed }}/{{ goal.total }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full"
              :style="{ width: (goal.completed/goal.total*100)+'%' }"
            ></div>
          </div>
        </div>
        <p v-if="!goals.length" class="text-gray-500 text-sm">Sem metas definidas.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'

const store = useStore()
const user = computed(() => store.user)
const tasks = computed(() => store.tasks)
const goals = computed(() => store.goals)

const selectedDay = ref(new Date())

onMounted(async () => {
  await store.fetchTasks()
})

const todayTasks = computed(() =>
  tasks.value.filter(task => {
    const taskDate = task.due_date?.slice(0, 10)
    const selectedDate = selectedDay.value.toISOString().slice(0, 10)
    return taskDate === selectedDate
  })
)


const calendarAttributes = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
])

function goToDate(day) {
  selectedDay.value = day.date
}

function complete(task) {
  console.log('Completar tarefa:', task)
}
</script>

