<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow mt-10">
    <h1 class="text-2xl font-bold mb-4">Nova Tarefa</h1>
    <form @submit.prevent="submitTask">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Título</label>
        <input v-model="form.title" class="w-full border p-2 rounded-lg" :class="{ 'border-red-500': errors.title }"
          @input="errors.title = ''" required />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">
          {{ errors.title }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-semibold">Selecione as datas</label>
        <vc-calendar class="w-full" :attributes="attributes" :disabled-dates="disabledDatesArray"
          @dayclick="onDayClick" />
        <p v-if="errors.due_dates" class="text-red-500 text-sm mt-1">
          {{ errors.due_dates }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Subtarefas</label>

        <!-- Container rolável: -->
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          <div v-for="(sub, idx) in form.subtasks" :key="idx"
            class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2">
            <input v-model="sub.title" type="text" placeholder="Nova subtarefa"
              class="flex-1 bg-transparent focus:outline-none px-2 py-1 text-gray-700" />
            <button type="button" @click="removeSubtask(idx)" class="ml-2 hover:bg-red-100 p-1 rounded-full transition"
              aria-label="Remover subtarefa">
              <!-- ícone X -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <button type="button" @click="addSubtask"
          class="mt-2 inline-flex items-center text-blue-600 hover:underline focus:outline-none">
          <!-- ícone + -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar subtarefa
        </button>
      </div>



      <button type="submit" :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
        {{ loading ? 'Salvando...' : 'Salvar Tarefa' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { sidebar } from '../stores/menuSidebar'
import { ClipboardIcon, CheckCircleIcon, BellIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'

const toast = useToast()
const menuStore = sidebar()

menuStore.removeAllMenuItems()
menuStore.addMenuItem({ label: 'Dashboard', icon: ClipboardIcon, route: '/Dashboard' })
menuStore.addMenuItem({ label: 'Nova Meta', icon: CheckCircleIcon, route: '/NovaMeta' })
menuStore.addMenuItem({ label: 'Lembretes', icon: BellIcon, route: '/NovoLembrete' })

const store = useStore()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  title: '',
  due_dates: [],
  subtasks: [],
})
const errors = reactive({
  title: '',
  due_dates: '',
})

const selectedDays = ref([])

const today = new Date()
today.setHours(0, 0, 0, 0)

const disabledDatesArray = ref([
  { end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) }
])

const attributes = computed(() =>
  selectedDays.value.map((day) => ({
    key: `selected-${day.date.toISOString()}`,
    dates: day.date,
    highlight: {
      backgroundColor: '#3b82f6',
      borderRadius: '50%',
    },
  }))
)

const isDatePast = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d < today
}

const onDayClick = ({ date }) => {
  if (isDatePast(date)) {
    toast.warning('Não é permitido selecionar datas anteriores a hoje.')
    return
  }

  const dateStr = new Date(date).toDateString()
  const idx = selectedDays.value.findIndex(
    (d) => new Date(d.date).toDateString() === dateStr
  )

  if (idx >= 0) {
    selectedDays.value.splice(idx, 1)
  } else {
    selectedDays.value.push({ date })
  }

  form.due_dates = selectedDays.value.map((d) => d.date)
}

const addSubtask = () => {
  form.subtasks.push({ title: '' })
}
const removeSubtask = (idx) => {
  form.subtasks.splice(idx, 1)
}

const submitTask = async () => {
  if (!form.title.trim()) {
    toast.warning('O título da tarefa é obrigatório.')
    return
  }

  if (!form.due_dates.length) {
    toast.warning('Selecione ao menos uma data.')
    return
  }

  try {
    await store.createTask({ form, errors, loading, selectedDays, router })
    toast.success('Tarefa criada com sucesso!')
    router.push('/dashboard')
  } catch (err) {
    toast.error('Erro ao criar tarefa.')
    console.error('Erro ao criar tarefa:', err)
  }
}
</script>
