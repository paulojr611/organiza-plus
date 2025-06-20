<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Olá, {{ user.name }}!</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-auto">

      <div class="bg-white p-4 rounded-2xl shadow flex flex-col">
        <div>
          <h2 class="font-semibold mb-3">Calendário</h2>
          <vc-calendar class="w-full mb-6" is-expanded :attributes="calendarAttributes" @dayclick="goToDate" />
        </div>

        <h2 class="text-xl font-semibold mb-4">
          Lembretes de {{ selectedDay.toLocaleDateString('pt-BR') }}
        </h2>
        <ul class="space-y-4 overflow-y-auto max-h-96">
          <li v-for="rem in filteredReminders" :key="rem.id"
            class="flex justify-between items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div>
              <h3 class="font-medium text-blue-800">{{ rem.title }}</h3>
              <small class="text-xs text-gray-600">{{ formatReminderTime(rem.remind_at) }}</small>
            </div>
          </li>
          <li v-if="!filteredReminders.length" class="text-center text-gray-400">
            Sem lembretes para este dia.
          </li>
        </ul>
      </div>


      <!-- METAS -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h2 class="font-semibold text-lg mb-4">Progresso das Metas</h2>

        <!-- Container rolável -->
        <div class="max-h-[76vh] overflow-y-auto pr-2 space-y-5">
          <div v-for="goal in filteredGoals" :key="goal.id" :class="[
            'p-4 rounded-2xl border shadow-sm hover:shadow transition-shadow duration-200',
            goalProgressPercent(goalInputs[goal.id], goal.target_value) >= 100
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-100'
          ]">
            <!-- Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <p :class="[
                  'text-base md:text-lg font-semibold',
                  goalProgressPercent(goalInputs[goal.id], goal.target_value) >= 100
                    ? 'text-green-800'
                    : 'text-gray-800'
                ]">
                  {{ goal.title }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(goal.start_date) }} até {{ formatDate(goal.end_date) }}
                </p>
              </div>

              <div class="flex flex-col items-end gap-2">
                <div class="flex gap-2">
                  <button @click="editGoal(goal)" class="p-1 rounded-full hover:bg-gray-200 transition"
                    title="Editar meta">
                    <PencilIcon :class="goalProgressPercent(goalInputs[goal.id], goal.target_value) >= 100
                      ? 'text-green-800 hover:text-green-900'
                      : 'text-gray-600 hover:text-gray-800'" class="w-5 h-5" />
                  </button>
                  <button @click="openConfirmGoal(goal.id)" class="p-1 rounded-full hover:bg-red-100 transition"
                    title="Excluir meta">
                    <TrashIcon class="w-5 h-5 text-red-600 hover:text-red-800" />
                  </button>
                </div>
                <span class="mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full" :class="goalProgressPercent(goalInputs[goal.id], goal.target_value) >= 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'">
                  {{ goalProgressPercent(goalInputs[goal.id], goal.target_value) }}%
                </span>
              </div>
            </div>

            <!-- Input de progresso -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div class="flex items-center gap-2">
                <label :for="'completed-' + goal.id" class="text-sm text-gray-600">
                  Concluído:
                </label>
                <input :id="'completed-' + goal.id" v-model.number="goalInputs[goal.id]" type="number" min="0"
                  :max="goal.target_value" @blur="saveGoalProgress(goal)" @keyup.enter="saveGoalProgress(goal)"
                  class="w-20 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                <span class="text-sm text-gray-500">/ {{ goal.target_value }}</span>
              </div>
            </div>

            <!-- Barra de progresso -->
            <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div class="h-4 transition-all duration-500 rounded-full"
                :class="goalProgressColor(goalProgressPercent(goalInputs[goal.id], goal.target_value))"
                :style="{ width: goalProgressPercent(goalInputs[goal.id], goal.target_value) + '%' }"></div>
            </div>
          </div>
        </div>

        <p v-if="!filteredGoals.length" class="text-center text-gray-500 text-sm mt-6">
          Sem metas definidas.
        </p>
      </div>





      <!-- TAREFAS -->
      <div class="bg-white p-4 rounded-2xl shadow col-span-2
         h-[calc(101vh-3.5rem-4rem-2rem)] overflow-y-auto">
        <h2 class="font-semibold mb-3">
          Tarefas de {{ selectedDay.toLocaleDateString('pt-BR') }}
        </h2>

        <!-- Progresso -->
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>Progresso</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div class="h-4 transition-all duration-300" :class="progressBarColor"
              :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <!-- Filtro de status e pesquisa -->
        <nav class="flex justify-between items-start border-b border-gray-200 mb-5">
          <!-- Filtros -->
          <div class="flex space-x-6 pt-1">
            <button v-for="option in statusOptions" :key="option" @click="statusFilter = option" type="button" :class="[
              'pb-2 font-medium text-sm transition-colors',
              statusFilter === option
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]">
              {{ option }}
            </button>
          </div>
          <div class="mt-0">
            <input type="search" v-model="searchTerm" placeholder=" Pesquisar tarefa..."
              class="border border-gray-300 rounded-full px-5 py-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-72 -translate-y-1" />
          </div>

        </nav>

        <!-- Lista de tarefas -->
        <ul class="space-y-4">
          <li v-for="task in filteredTasks" :key="task.id"
            class="p-4 bg-gray-100 rounded-2xl shadow flex flex-col space-y-2">
            <!-- Cabeçalho -->
            <div class="flex justify-between items-start">
              <h3 class="font-semibold text-lg">{{ task.title }}</h3>
              <div class="flex space-x-2 items-center">

                <!-- Botões -->
                <button v-if="task.subtasks && task.subtasks.length > 0" @click="toggleExpanded(task.id)"
                  class="text-blue-600 hover:text-blue-800" aria-label="Expandir subtarefas"
                  title="Expandir subtarefas">
                  <span v-if="expandedTasks.includes(task.id)">
                    <ArrowDownCircleIcon class="w-6 h-6" />
                  </span>
                  <span v-else>
                    <ArrowRightCircleIcon class="w-6 h-6" />
                  </span>
                </button>
                <button @click="openDateModal(task)" class="p-1 rounded hover:bg-gray-200" aria-label="Alterar data"
                  title="Alterar data">
                  <CalendarDaysIcon class="w-5 h-5" />
                </button>

                <button @click="openNotesModal(task)" :class="[
                  'p-1 rounded',
                  task.notes
                    ? 'hover:bg-blue-200'
                    : 'hover:bg-gray-200'
                ]" title="Anotações" aria-label="Anotações">
                  <PencilSquareIcon :class="[
                    'w-5 h-5 transition-colors duration-200',
                    task.notes ? 'text-blue-600' : 'text-black'
                  ]" />
                </button>

                <button @click="editTask(task)" class="p-1 rounded hover:bg-gray-200" title="Editar tarefa"
                  aria-label="Editar tarefa">
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button @click="openConfirmTask(task.id)" class="text-red-600 hover:text-red-800" title="Excluir tarefa"
                  aria-label="Excluir tarefa">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Status -->
            <div :class="cardClassByStatus(task.status) +
              ' flex items-center space-x-2 flex-wrap p-3 rounded-xl transition-all duration-300'
              ">
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

            <!-- Subtarefas -->
            <transition name="fade">
              <ul v-if="expandedTasks.includes(task.id)" class="ml-4 mt-3 space-y-2">
                <li v-for="sub in task.subtasks" :key="sub.id" class="flex items-center text-sm">
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="sub.status === 'Concluída'" @change="toggleSubtask(sub, task)"
                      class="peer sr-only" />

                    <div
                      class="w-5 h-5 rounded border-2 border-gray-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center transition">
                      <svg v-if="sub.status === 'Concluída'" xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    <span :class="{ 'line-through text-gray-400': sub.status === 'Concluída' }" class="ml-2">
                      {{ sub.title }}
                    </span>
                  </label>
                </li>
              </ul>
            </transition>
          </li>

          <!-- Sem tarefas -->
          <li v-if="!filteredTasks.length" class="text-gray-500">
            Nenhuma tarefa.
          </li>
        </ul>
      </div>

      <!-- Modal de alterar data -->
      <div v-if="editingTask" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 w-80">
          <h2 class="text-lg font-bold mb-4 break-words">
            Alterar data de "{{ editingTask.title }}"
          </h2>

          <!-- VCalendar Date Picker -->
          <vc-date-picker v-model="editingTask.date" :min-date="today" is-inline :popover="{ visibility: 'click' }"
            class="w-full mb-4" />

          <div class="flex justify-end space-x-2">
            <button @click="closeDateModal" class="px-4 py-2 rounded border">
              Cancelar
            </button>
            <button @click="saveTaskDate" class="px-4 py-2 rounded bg-indigo-600 text-white">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Anotações -->
    <div v-if="showNotesModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-3xl mx-4" style="max-height: 85vh; overflow-y: auto;">
        <h2 class="text-lg font-bold mb-4">
          Anotações para "{{ selectedTask.title }}"
        </h2>

        <textarea v-model="notesText"
          class="w-full border rounded-xl p-2 h-60 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escreva sua anotação aqui..." maxlength="500"></textarea>

        <div class="text-right text-xs text-gray-400 mt-1">
          {{ notesText.length }}/500 caracteres
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="closeNotesModal" class="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button @click="saveNotes" class="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white">
            Salvar
          </button>
        </div>
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
    <dialog ref="confirmDialogGoal" class="rounded-2xl p-6 bg-white shadow-lg">
      <p class="text-lg mb-4">Deseja realmente excluir esta meta?</p>
      <div class="flex justify-end gap-3">
        <button @click="cancelGoal" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
          Cancelar
        </button>
        <button @click="confirmDeleteGoal" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
          Excluir
        </button>
      </div>
    </dialog>
    <dialog ref="confirmDialogTask" class="rounded-2xl p-6 bg-white shadow-lg">
      <p class="text-lg mb-4">Deseja realmente excluir esta tarefa?</p>
      <div class="flex justify-end gap-3">
        <button @click="cancelTask" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
          Cancelar
        </button>
        <button @click="confirmDeleteTask" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
          Excluir
        </button>
      </div>
    </dialog>
  </div>


</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useStore } from '@/stores'
import { PaperClipIcon, CheckCircleIcon, BellIcon, CalendarDaysIcon, PencilSquareIcon, PencilIcon, TrashIcon, ArrowDownCircleIcon, ArrowRightCircleIcon } from '@heroicons/vue/24/outline'
import { sidebar } from '../stores/menuSidebar'
import { useToast } from 'vue-toastification'

const toast = useToast()
const menuStore = sidebar()
const store = useStore()
const user = computed(() => store.user)
const tasks = computed(() => store.tasks)
const goals = computed(() => store.goals)
const reminders = computed(() => store.reminders)


//carrega tudo
async function loadData() {
  try {
    await store.fetchGoals()
    initializeGoalInputs()

    await store.fetchTasks()
    await store.fetchReminders()
    store.reminders = store.reminders.map(r => {
      const dt = new Date(r.remind_at)
      const corrected = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      const localIso = corrected.toISOString().replace(/Z$/, '')
      return { ...r, remind_at: localIso }
    })
  } catch (err) {
    console.error('Erro ao buscar dados iniciais:', err)
  }
}
watch(
  () => store.user,
  (user) => {
    if (user) loadData()
  },
  { immediate: true }
)



watch(goals, () => {
  initializeGoalInputs()
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


menuStore.removeAllMenuItems()
menuStore.addMenuItem({ label: 'Nova Tarefa', icon: PaperClipIcon, route: '/NovaTarefa' })
menuStore.addMenuItem({ label: 'Nova Meta', icon: CheckCircleIcon, route: '/NovaMeta' })
menuStore.addMenuItem({ label: 'Lembretes', icon: BellIcon, route: '/NovoLembrete' })


// Pontinhos no calendário 
const calendarAttributes = computed(() => {
  const attrs = []

  const todayTs = new Date()
  todayTs.setHours(0, 0, 0, 0)
  attrs.push({
    key: 'hoje',
    dates: todayTs,
    highlight: { fillMode: 'light' },
    order: 98,
  })


  function groupByDay(items, dateKey) {
    const map = new Map()
    items.forEach(item => {
      const ts = new Date(item[dateKey]).setHours(0, 0, 0, 0)
      if (!map.has(ts)) map.set(ts, [])
      map.get(ts).push(item)
    })
    return map
  }

  if (store.tasks.length) {
    const tasksByDay = groupByDay(store.tasks, 'due_date')
    for (const [ts, tasks] of tasksByDay.entries()) {
      attrs.push({
        key: `tarefas-${ts}`,
        dates: ts,
        dot: { color: 'blue' },
        popover: {
          label: tasks.map(t => `• ${t.title}`).join('\n'),
        },
        order: 1,
      })
    }
  }

  if (store.reminders.length) {
    const remByDay = groupByDay(store.reminders, 'remind_at')
    for (const [ts, rems] of remByDay.entries()) {
      attrs.push({
        key: `lembretes-${ts}`,
        dates: ts,
        dot: { color: 'red' },
        popover: {
          label: rems.map(r => `• ${r.title}`).join('\n'),
        },
        order: 2,
      })
    }
  }

  return attrs
})




const searchTerm = ref('')

const filteredTasks = computed(() => {
  let filtered = statusFilter.value === 'Todos'
    ? todayTasks.value
    : todayTasks.value.filter(task => task.status === statusFilter.value);

  if (searchTerm.value.trim() !== '') {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(task => task.title.toLowerCase().includes(term));
  }

  return filtered;
});


const expandedTasks = ref([])

const toggleExpanded = (taskId) => {
  if (expandedTasks.value.includes(taskId)) {
    expandedTasks.value = expandedTasks.value.filter(id => id !== taskId)
  } else {
    expandedTasks.value.push(taskId)
  }
}

const toggleSubtask = async (sub, task) => {
  const newStatus = sub.status === "Concluída" ? "Não iniciada" : "Concluída";

  try {
    await store.updateSubtaskStatus(sub.id, newStatus);
    sub.status = newStatus;

    // Se a task estiver "Não iniciada", muda pra "Em andamento" ---- não tirar essa parte, já excluiu 3 vezes achando que era outra coisa
    if (task.status === "Não iniciada") {
      await store.updateTaskStatus(task.id, "Em andamento");
    }
  } catch (err) {
    console.error("Erro ao atualizar subtarefa:", err);
  }
};

const editingTask = ref(null)

function openDateModal(task) {
  editingTask.value = { ...task }
}
function closeDateModal() {
  editingTask.value = null
}

async function saveTaskDate() {
  try {
    await store.updateDate(editingTask.value.id, editingTask.value.date)
    const idx = store.tasks.findIndex(t => t.id === editingTask.value.id)
    if (idx !== -1) store.tasks[idx].date = editingTask.value.date


    const isoDay = selectedDay.value.toISOString().slice(0, 10)
    await store.fetchTasksByDate(isoDay)

    toast.success('Data atualizada e lista refeita!')
    closeDateModal()
  } catch (err) {
    console.error(err)
    toast.error('Erro ao atualizar data')
  }
}


const today = new Date()
today.setHours(0, 0, 0, 0)



function initializeGoalInputs() {
  goals.value.forEach(g => {
    if (goalInputs[g.id] === undefined) {
      goalInputs[g.id] = g.completed
    }
  })
  Object.keys(goalInputs).forEach(key => {
    if (!goals.value.find(g => g.id === Number(key))) {
      delete goalInputs[key]
    }
  })
}

const confirmDialogGoal = ref(null)
const confirmDialogTask = ref(null)
const deletingId = ref(null)

function openConfirmGoal(id) {
  deletingId.value = id
  confirmDialogGoal.value.showModal()
}
function openConfirmTask(id) {
  deletingId.value = id
  confirmDialogTask.value.showModal()
}
function cancelGoal() {
  confirmDialogGoal.value.close()
  deletingId.value = null
}
function cancelTask() {
  confirmDialogTask.value.close()
  deletingId.value = null
}

async function confirmDeleteGoal() {
  try {
    await store.deleteGoal(deletingId.value)
    toast.success('Meta excluída com sucesso!')
  } catch (err) {
    toast.error('Erro ao excluir meta.')
    console.error('Erro ao excluir meta:', err)
  } finally {
    confirmDialogGoal.value.close()
    deletingId.value = null
    await store.fetchGoals()
  }
}
async function confirmDeleteTask() {
  try {
    await store.deleteTask(deletingId.value)
    toast.success('Tarefa excluída com sucesso!')
  } catch (err) {
    toast.error('Erro ao excluir tarefa.')
    console.error('Erro ao excluir tarefa:', err)
  } finally {
    confirmDialogTask.value.close()
    deletingId.value = null
    await store.fetchTasks()
  }
}


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
    toast.success('Nome da tarefa alterada!')
    await store.fetchTasks()
  } catch (error) {
    console.error('Erro ao salvar edição:', error)
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



const showDateModal = ref(false)
const showConfirmModal = ref(false)
const showNotesModal = ref(false)

const selectedTask = ref(null)
const notesText = ref('')

function openNotesModal(task) {
  showDateModal.value = false
  showConfirmModal.value = false
  selectedTask.value = task
  notesText.value = task.notes || ''
  showNotesModal.value = true
}
function closeNotesModal() {
  showNotesModal.value = false
  selectedTask.value = null
  notesText.value = ''
}

async function saveNotes() {
  if (!selectedTask.value) return

  try {
    await store.updateTaskNotes(selectedTask.value.id, notesText.value)

    selectedTask.value.notes = notesText.value

    closeNotesModal()
  }
  catch (err) {
    console.error('Erro ao salvar anotação:', err)
    alert('Não foi possível salvar sua anotação.')
  }
}







const goalInputs = reactive({})

const goalProgressPercent = (completed, target) => {
  if (!target) return 0;
  // calcula percentual real
  const rawPercent = (completed / target) * 100;
  // arredonda sempre pra baixo e garante entre 0 e 100
  return Math.min(Math.max(Math.floor(rawPercent), 0), 100);
};

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
    goalInputs[goal.id] = goal.completed
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
    toast.success('Nome da meta alterada!') //gambiarra, tá confirmando sem ter certeza se vai dar erro

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
  const selDateString = selectedDay.value.toISOString().split('T')[0];
  return goals.value.filter(goal => {
    const startDateString = goal.start_date.split('T')[0];
    const endDateString = goal.end_date.split('T')[0];
    return selDateString >= startDateString && selDateString <= endDateString;
  });
})










import { scheduleNotification } from "@/utils/notification";

onMounted(async () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  await store.fetchReminders();
  /*
    reminders.value = store.reminders.map(r => ({
      ...r,
      remind_at: typeof r.remind_at === 'string'
        ? new Date(r.remind_at.replace(' ', 'T'))
        : r.remind_at
    }));
  */
  reminders.value.forEach(r => scheduleNotification(r));
});

const filteredReminders = computed(() => {
  return reminders.value
    .map(r => ({
      ...r,
      remind_at: typeof r.remind_at === 'string'
        ? new Date(r.remind_at.replace(' ', 'T'))
        : r.remind_at
    }))
    .filter(r => {
      const dt = r.remind_at;
      return (
        dt.getFullYear() === selectedDay.value.getFullYear() &&
        dt.getMonth() === selectedDay.value.getMonth() &&
        dt.getDate() === selectedDay.value.getDate()
      );
    });
});

function formatReminderTime(dt) {
  return dt instanceof Date
    ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';
}

</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
