<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Olá, {{ user.name }}!</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-auto">
      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">
          Tarefas de {{ selectedDay.toLocaleDateString('pt-BR') }}
        </h2>

        <!-- filtro estilo tabs -->
        <nav class="flex space-x-6 border-b border-gray-200 mb-5" aria-label="Filtro de status">
          <button
            v-for="option in statusOptions"
            :key="option"
            @click="statusFilter = option"
            type="button"
            :class="[
              'pb-2 font-medium text-sm transition-colors',
              statusFilter === option
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ option }}
          </button>
        </nav>

        <ul class="space-y-4">
          <li
            v-for="task in filteredTasks"
            :key="task.id"
            class="p-4 bg-gray-100 rounded-2xl shadow flex flex-col space-y-2"
          >
            <div class="flex justify-between items-start">
              <h3 class="font-semibold text-lg">{{ task.title }}</h3>
              <div class="flex space-x-2">
                <button
                  @click="editTask(task)"
                  class="text-yellow-600 hover:text-yellow-800"
                  aria-label="Editar tarefa"
                >
                  ✏️
                </button>
                <button
                  @click="deleteTask(task)"
                  class="text-red-600 hover:text-red-800"
                  aria-label="Excluir tarefa"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div
              :class="cardClassByStatus(task.status) + ' flex items-center space-x-2 flex-wrap p-3 rounded-xl transition-all duration-300'"
            >
              <span class="text-sm text-gray-600">Status:</span>
              <button
                @click="updateStatus(task, 'Não iniciada')"
                class="text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-sm"
              >
                Não iniciada
              </button>
              <button
                @click="updateStatus(task, 'Em andamento')"
                class="text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full text-sm"
              >
                Em andamento
              </button>
              <button
                @click="updateStatus(task, 'Concluída')"
                class="text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full text-sm"
              >
                Concluída
              </button>
            </div>
          </li>

          <li v-if="!filteredTasks.length" class="text-gray-500">Nenhuma tarefa.</li>
        </ul>
      </div>

      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">Calendário</h2>
        <vc-calendar is-expanded :attributes="calendarAttributes" @dayclick="goToDate" />
      </div>

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
              :style="{ width: (goal.completed / goal.total * 100) + '%' }"
            ></div>
          </div>
        </div>
        <p v-if="!goals.length" class="text-gray-500 text-sm">Sem metas definidas.</p>
      </div>
    </div>

    <!-- Modal para editar o título da tarefa -->
    <div
      v-if="isEditing"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Editar Tarefa</h3>
        <form @submit.prevent="saveEdit">
          <label class="block mb-4">
            Nome da tarefa:
            <input
              v-model="editTaskTitle"
              type="text"
              required
              class="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeEditModal"
              class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { sidebar } from '../stores/menuSidebar'

const menuStore = sidebar()
const store = useStore()
const user = computed(() => store.user)
const tasks = computed(() => store.tasks)
const goals = computed(() => store.goals)

const selectedDay = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
)

const statusOptions = ['Todos', 'Não iniciada', 'Em andamento', 'Concluída']
const statusFilter = ref('Todos')

const isEditing = ref(false)
const editTaskId = ref(null)
const editTaskTitle = ref('')

const addSide = () => {
  menuStore.addMenuItem({ label: 'Nova Tarefa', icon: PaperClipIcon, route: '/NovaTarefa' })
}
const removeSide = () => {
  menuStore.removeAllMenuItems()
}

onMounted(async () => {
  removeSide()
  addSide()
  await store.fetchTasks()
})

function goToDate(day) {
  selectedDay.value = day.date
}

const todayTasks = computed(() => {
  return tasks.value.filter(task => {
    if (!task.due_date) return false
    const taskDateStr = task.due_date.split('T')[0]
    const selectedDateStr = selectedDay.value.toISOString().split('T')[0]
    return taskDateStr === selectedDateStr
  })
})

const filteredTasks = computed(() => {
  if (statusFilter.value === 'Todos') {
    return todayTasks.value
  } else {
    return todayTasks.value.filter(task => task.status === statusFilter.value)
  }
})

const calendarAttributes = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
])

async function updateStatus(task, status) {
  try {
    await store.updateTaskStatus(task.id, status)
  } catch (error) {
    if (error.response) {
      console.error('Erro detalhado do backend:', error.response.data)
    } else {
      console.error('Erro desconhecido:', error)
    }
  }
}

function editTask(task) {
  editTaskId.value = task.id
  editTaskTitle.value = task.title
  isEditing.value = true
}

function closeEditModal() {
  isEditing.value = false
  editTaskId.value = null
  editTaskTitle.value = ''
}

async function saveEdit() {
  try {
    await store.updateTask(editTaskId.value, { title: editTaskTitle.value });
    isEditing.value = false;
    editTaskId.value = null;
    editTaskTitle.value = '';
    await store.fetchTasks(); // atualiza a lista de tarefas
  } catch (error) {
    console.error('Erro ao salvar edição:', error);
  }
}
  

async function deleteTask(task) {
  try {
    await store.deleteTask(task.id)
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error)
  }
}

const cardClassByStatus = status => {
  switch (status) {
    case 'Não iniciada':
      return 'bg-white shadow-none'
    case 'Em andamento':
      return 'bg-yellow-100 shadow-[0_0_12px_2px_rgba(202,138,4,0.5)]'
    case 'Concluída':
      return 'bg-green-100 shadow-[0_0_12px_2px_rgba(21,128,61,0.5)]'
    default:
      return 'bg-gray-100 shadow'
  }
}
</script>
