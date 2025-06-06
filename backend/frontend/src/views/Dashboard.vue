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
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>Progresso</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div class="h-4 transition-all duration-300" :class="progressBarColor"
              :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        <nav class="flex space-x-6 border-b border-gray-200 mb-5" aria-label="Filtro de status">
          <button v-for="option in statusOptions" :key="option" @click="statusFilter = option" type="button" :class="[
            'pb-2 font-medium text-sm transition-colors',
            statusFilter === option
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]">
            {{ option }}
          </button>
        </nav>

        <ul class="space-y-4">
          <li v-for="task in filteredTasks" :key="task.id"
            class="p-4 bg-gray-100 rounded-2xl shadow flex flex-col space-y-2">
            <div class="flex justify-between items-start">
              <h3 class="font-semibold text-lg">{{ task.title }}</h3>
              <div class="flex space-x-2">
                <button @click="editTask(task)" class="text-yellow-600 hover:text-yellow-800"
                  aria-label="Editar tarefa">
                  ✏️
                </button>
                <button @click="deleteTask(task)" class="text-red-600 hover:text-red-800" aria-label="Excluir tarefa">
                  🗑️
                </button>
              </div>
            </div>

            <div
              :class="cardClassByStatus(task.status) + ' flex items-center space-x-2 flex-wrap p-3 rounded-xl transition-all duration-300'">
              <span class="text-sm text-gray-600">Status:</span>
              <button @click="updateStatus(task, 'Não iniciada')"
                class="text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-sm">
                Não iniciada
              </button>
              <button @click="updateStatus(task, 'Em andamento')"
                class="text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full text-sm">
                Em andamento
              </button>
              <button @click="updateStatus(task, 'Concluída')"
                class="text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full text-sm">
                Concluída
              </button>
            </div>
          </li>
          <li v-if="!filteredTasks.length" class="text-gray-500">Nenhuma tarefa.</li>
        </ul>
      </div>

      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">Calendário</h2>
        <vc-calendar  class="w-full" is-expanded :attributes="calendarAttributes" @dayclick="goToDate" />
      </div>

      <!--METAS-->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold mb-3">Progresso das Metas</h2>

        <div v-for="goal in filteredGoals" :key="goal.id" class="mb-5 p-4 rounded-lg border border-gray-100 bg-gray-50">
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="text-base md:text-lg font-semibold block">{{ goal.title }}</span>
              <span class="text-xs text-gray-500 block">
                {{ formatDate(goal.start_date) }} até {{ formatDate(goal.end_date) }}
              </span>
            </div>

            <div class="flex gap-2 text-xl">
              <button @click="editGoal(goal)" class="text-blue-500 hover:text-blue-700" title="Editar Meta">
                ✏️
              </button>
              <button @click="deleteGoal(goal.id)" class="text-red-500 hover:text-red-700" title="Excluir Meta">
                🗑️
              </button>
            </div>
          </div>

          <div class="flex flex-col md:flex-row justify-between items-center mb-3 space-y-2 md:space-y-0">
            <div class="flex items-center space-x-2">
              <label :for="'completed-' + goal.id" class="text-sm text-gray-600">
                Concluído:
              </label>
              <input :id="'completed-' + goal.id" v-model.number="goalInputs[goal.id]" type="number" min="0"
                :max="goal.target_value" @blur="saveGoalProgress(goal)" @keyup.enter="saveGoalProgress(goal)"
                class="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              <span class="text-sm text-gray-500">
                / {{ goal.target_value }}
              </span>
            </div>

          </div>
          <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div class="h-4 transition-width duration-500 rounded-full"
              :class="goalProgressColor(goalProgressPercent(goalInputs[goal.id], goal.target_value))"
              :style="{ width: goalProgressPercent(goalInputs[goal.id], goal.target_value) + '%' }"></div>
          </div>


        </div>

        <p v-if="!goals.length" class="text-gray-500 text-sm">Sem metas definidas.</p>
      </div>
    </div>

    <div v-if="isEditing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeEditModal">
      <div class="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Editar Tarefa</h3>
        <form @submit.prevent="saveEdit">
          <label class="block mb-4">
            Nome da tarefa:
            <input v-model="editTaskTitle" type="text" required class="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeEditModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isEditingGoal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeGoalEditModal">
      <div class="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Editar Meta</h3>
        <form @submit.prevent="saveGoalEdit">
          <label class="block mb-4">
            Nome da meta:
            <input v-model="editGoalTitle" type="text" required class="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeGoalEditModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useStore } from '@/stores'
import { PaperClipIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { sidebar } from '../stores/menuSidebar'

const menuStore = sidebar()
const store = useStore()
const user = computed(() => store.user)
const tasks = computed(() => store.tasks)
const goals = computed(() => store.goals)

const selectedDay = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
)

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR')
}


const statusOptions = ['Todos', 'Não iniciada', 'Em andamento', 'Concluída']
const statusFilter = ref('Todos')

const isEditing = ref(false)
const editTaskId = ref(null)
const editTaskTitle = ref('')


const addSide = () => {
  menuStore.addMenuItem({ label: 'Nova Tarefa', icon: PaperClipIcon, route: '/NovaTarefa' })
  menuStore.addMenuItem({ label: 'Nova Meta', icon: CheckCircleIcon, route: '/NovaMeta' })
}
const removeSide = () => {
  menuStore.removeAllMenuItems()
}

onMounted(async () => {
  removeSide()
  addSide()

  await store.fetchGoals()
  initializeGoalInputs()

  await store.fetchTasks()
})

// Se as metas mudam (criação/edição/exclusão), atualiza goalInputs
watch(goals, () => {
  initializeGoalInputs()
})

// Preenche goalInputs com o completed de cada meta existente
function initializeGoalInputs() {
  goals.value.forEach(g => {
    if (goalInputs[g.id] === undefined) {
      goalInputs[g.id] = g.completed
    }
  })
  // Remove chaves que não existem mais em goals
  Object.keys(goalInputs).forEach(key => {
    if (!goals.value.find(g => g.id === Number(key))) {
      delete goalInputs[key]
    }
  })
}

// Navegação por data no calendário
function goToDate(day) {
  selectedDay.value = day.date
}

// Filtra tarefas para o dia selecionado
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

// Configurações do calendário (por enquanto só marca “hoje”)
const calendarAttributes = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
])

// Progress bar de tarefas
const completed = computed(() => todayTasks.value.filter(t => t.status === 'Concluída').length)
const total = computed(() => todayTasks.value.length)

const progressPercent = computed(() => {
  return total.value === 0 ? 0 : Math.round((completed.value / total.value) * 100)
})

const progressBarColor = computed(() => {
  if (progressPercent.value === 0) return 'bg-gray-400'
  if (progressPercent.value < 40) return 'bg-red-500'
  if (progressPercent.value < 90) return 'bg-yellow-400'
  if (progressPercent.value < 100) return 'bg-blue-500'
  return 'bg-green-500'
})

// Ações sobre tarefas
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
    await store.updateTask(editTaskId.value, { title: editTaskTitle.value })
    isEditing.value = false
    editTaskId.value = null
    editTaskTitle.value = ''
    await store.fetchTasks()
  } catch (error) {
    console.error('Erro ao salvar edição:', error)
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


const goalInputs = reactive({})

function goalProgressPercent(completedValue, targetValue) {
  if (!targetValue || targetValue === 0) return 0
  return Math.min(100, Math.round((completedValue / targetValue) * 100))
}

function goalProgressColor(percent) {
  if (percent === 0) return 'bg-gray-400'
  if (percent < 40) return 'bg-red-500'
  if (percent < 80) return 'bg-yellow-400'
  if (percent < 100) return 'bg-blue-500'
  return 'bg-green-500'
}

async function saveGoalProgress(goal) {
  const newCompleted = goalInputs[goal.id]
  if (newCompleted < 0 || newCompleted > goal.target_value) {
    alert(`Informe um valor entre 0 e ${goal.target_value}.`)
    goalInputs[goal.id] = goal.completed
    return
  }

  try {
    await store.updateGoal(goal.id, { completed: newCompleted })
    await store.fetchGoals()
    goalInputs[goal.id] = newCompleted
  } catch (error) {
    console.error('Erro ao atualizar progresso da meta:', error)
    alert('Houve um erro ao salvar o progresso. Tente novamente.')
    goalInputs[goal.id] = goal.completed
  }
}

async function deleteGoal(goalId) {
  if (!confirm('Tem certeza que deseja excluir esta meta?')) return

  try {
    await store.deleteGoal(goalId)
    await store.fetchGoals()
  } catch (error) {
    console.error('Erro ao excluir meta:', error)
  }
}

const isEditingGoal = ref(false)
const editGoalId = ref(null)
const editGoalTitle = ref('')

function editGoal(goal) {
  editGoalId.value = goal.id
  editGoalTitle.value = goal.title
  isEditingGoal.value = true
}

function closeGoalEditModal() {
  isEditingGoal.value = false
  editGoalId.value = null
  editGoalTitle.value = ''
}

async function saveGoalEdit() {
  try {
    const goal = store.goals.find(g => g.id === editGoalId.value)
    if (!goal) throw new Error('Meta não encontrada.')

    await store.updateGoal(editGoalId.value, {
      title: editGoalTitle.value,
      completed: goal.completed,
    })
    await store.fetchGoals()
    isEditingGoal.value = false
    editGoalId.value = null
    editGoalTitle.value = ''
  } catch (error) {
    console.error('Erro ao salvar edição da meta:', error)
  }
}
const filteredGoals = computed(() => {
  // selectedDay.value já é um objeto Date
  return goals.value.filter(goal => {
    const start = new Date(goal.start_date)
    const end = new Date(goal.end_date)
    const sel = new Date(selectedDay.value.toDateString())
    // compara se selectedDay está entre start e end (inclusive)
    return sel >= start && sel <= end
  })
})


</script>
