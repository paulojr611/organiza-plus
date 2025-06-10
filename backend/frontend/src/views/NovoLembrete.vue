<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow mt-10">
    <h1 class="text-2xl font-bold mb-4">Novo Lembrete</h1>
    <form @submit.prevent="submitReminder">
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
        <label class="block mb-1 font-semibold">Descrição (opcional)</label>
        <textarea
          v-model="form.description"
          class="w-full border p-2 rounded-lg"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-semibold">Selecione a data</label>
        <vc-calendar
          class="w-full"
          is-expanded
          :attributes="attributes"
          :disabled-dates="disabledDatesArray"
          @dayclick="onDayClick"
        />
        <p v-if="errors.remind_at" class="text-red-500 text-sm mt-1">
          {{ errors.remind_at }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-semibold">Horário</label>
        <input
          type="time"
          v-model="time"
          class="w-full border p-2 rounded-lg"
        />
      </div>

      <!-- Botão com ícone de informação ao lado -->
      <div class="flex items-center gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {{ loading ? 'Salvando...' : 'Salvar Lembrete' }}
        </button>

        <!-- Tooltip com ícone -->
        <div class="relative group">
          <InformationCircleIcon class="w-5 h-5 text-blue-500 cursor-pointer" />
          <div
            class="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 text-sm bg-gray-800 text-white p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            Para receber lembretes, ative as notificações no navegador e no sistema.
          </div>
        </div>
      </div>
    </form>
  </div>
</template>


<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { sidebar } from '@/stores/menuSidebar'
import { ClipboardIcon, PaperClipIcon, CheckCircleIcon, InformationCircleIcon  } from '@heroicons/vue/24/outline'

const menuStore = sidebar()
menuStore.removeAllMenuItems()
menuStore.addMenuItem({ label: 'Dashboard', icon: ClipboardIcon, route: '/Dashboard' })
menuStore.addMenuItem({ label: 'Nova Tarefa', icon: PaperClipIcon, route: '/NovaTarefa' })
menuStore.addMenuItem({ label: 'Nova Meta', icon: CheckCircleIcon, route: '/NovaMeta' })

const router = useRouter()
const store = useStore()

const loading = ref(false)
const form = reactive({
  title: '',
  description: '',
  remind_at: null,
})
const errors = reactive({
  title: '',
  remind_at: '',
})

const selectedDate = ref(null)
const time = ref('12:00')

const today = new Date()
today.setHours(0, 0, 0, 0)

const disabledDatesArray = ref([
  { end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) }
])

const attributes = computed(() =>
  selectedDate.value
    ? [{
        key: 'selected-date',
        dates: selectedDate.value,
        highlight: { backgroundColor: '#3b82f6', borderRadius: '50%' },
      }]
    : []
)

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
  selectedDate.value = date
}

const submitReminder = () => {
  store.createReminder({ form, errors, selectedDate, time, loading, router })
}
</script>
