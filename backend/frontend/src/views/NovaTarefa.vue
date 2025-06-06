<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow mt-10">
    <h1 class="text-2xl font-bold mb-4">Nova Tarefa</h1>
    <form @submit.prevent="submitTask">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Título</label>
        <input
          v-model="form.title"
          class="w-full border p-2 rounded-lg"
          :class="{ 'border-red-500': errors.title }"
          @input="errors.title = ''"
          required
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">
          {{ errors.title }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-semibold">Selecione as datas</label>
        <vc-calendar
          class="w-full"
          :attributes="attributes"
          :disabled-dates="disabledDatesArray"
          @dayclick="onDayClick"
        />
        <p v-if="errors.due_dates" class="text-red-500 text-sm mt-1">
          {{ errors.due_dates }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
      >
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
import { ClipboardIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const menuStore = sidebar()
const removeSide = () => menuStore.removeAllMenuItems()
const addSide = () => {
  menuStore.addMenuItem({ label: 'Dashboard', icon: ClipboardIcon, route: '/Dashboard' })
  menuStore.addMenuItem({ label: 'Nova Meta', icon: CheckCircleIcon, route: '/NovaMeta' })
}
removeSide()
addSide()

const store = useStore()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  title: '',
  due_dates: [],  
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

//Bloqueio de datas não funcionou, código abaixo serve pra impedir o clique
const isDatePast = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d < today
}
const onDayClick = ({ date }) => {
  if (isDatePast(date)) {
    alert('Não é permitido selecionar datas anteriores a hoje.')
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

const submitTask = () => {
  store.createTask({ form, errors, loading, selectedDays, router })
}
</script>
