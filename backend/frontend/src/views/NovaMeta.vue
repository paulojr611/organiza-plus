<template>
  <div class="max-w-xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow space-y-6">
    <h2 class="text-xl font-semibold">Criar Nova Meta</h2>

    <form @submit.prevent="submitGoal" class="space-y-4">
      <div>
        <label class="block mb-1 font-medium">Título da Meta</label>
        <input
          v-model="goal.title"
          type="text"
          class="w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label class="block mb-1 font-medium">Valor Alvo</label>
        <input
          v-model="goal.target_value"
          type="number"
          min="1"
          class="w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <vc-date-picker
        v-model="goalDateRange"
        is-range
        color="blue"
        :columns="1"
        class="w-full"
        :popover="{ visibility: 'click', placement: 'bottom' }"
        :disabled-dates="disabledDatesArray"
      />

      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">
        Salvar Meta
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores'
import { useRouter } from 'vue-router'
import { sidebar } from '../stores/menuSidebar'
import { PaperClipIcon, ClipboardIcon, BellIcon } from '@heroicons/vue/24/outline'

const menuStore = sidebar()
const store = useStore()
const router = useRouter()

const addSide = () => {
  menuStore.addMenuItem({ label: 'Dashboard', icon: ClipboardIcon, route: '/Dashboard' })
  menuStore.addMenuItem({ label: 'Nova Tarefa', icon: PaperClipIcon, route: '/NovaTarefa' })
  menuStore.addMenuItem({ label: 'Novo Lembrete', icon: BellIcon, route: '/NovoLembrete' })
}
const removeSide = () => {
  menuStore.removeAllMenuItems()
}

removeSide()
addSide()

const today = new Date()

const disabledDatesArray = [
  { end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) }
]

const goal = ref({
  title: '',
  target_value: null,
  start_date: '',
  end_date: ''
})

const goalDateRange = ref({ start: null, end: null })

async function submitGoal() {
  if (!goalDateRange.value.start || !goalDateRange.value.end) {
    alert('Selecione o intervalo de datas.')
    return
  }

  // Criado antes de ter um "import { formatLocalDatetime } from "@/utils/date";" no index - corrigir quando tiver tempo
  goal.value.start_date = goalDateRange.value.start.toISOString().split('T')[0]
  goal.value.end_date = goalDateRange.value.end.toISOString().split('T')[0]

  try {
    await store.createGoal(goal.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    alert('Erro ao criar meta.')
  }
}
</script>
