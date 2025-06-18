<template>
  <div class="max-h-screen w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow flex flex-col overflow-hidden mt-4">
    <header class="flex-none mb-4">
      <h1 class="text-3xl font-bold">Gerenciar Lembretes</h1>
    </header>

    <main class="flex-1 flex gap-8 overflow-hidden">
      <section class="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col overflow-y min-h-0">
        <h2 class="text-2xl font-semibold mb-4">Novo Lembrete</h2>
        <form @submit.prevent="submitReminder" class="space-y-4">
          <div>
            <label class="block mb-1 font-semibold">Título</label>
            <input v-model="form.title" class="w-full border p-2 rounded-lg" :class="{ 'border-red-500': errors.title }"
              @input="errors.title = ''" required />
            <p v-if="errors.title" class="text-red-500 text-sm mt-1">
              {{ errors.title }}
            </p>
          </div>

          <div>
            <label class="block mb-1 font-semibold">Descrição (opcional)</label>
            <textarea v-model="form.description" class="w-full border p-2 rounded-lg"></textarea>
          </div>

          <div>
            <label class="block mb-1 font-semibold">Selecione a data</label>
            <vc-calendar class="w-full" is-expanded :attributes="attributes" :disabled-dates="disabledDatesArray"
              @dayclick="onDayClick" />
            <p v-if="errors.remind_at" class="text-red-500 text-sm mt-1">
              {{ errors.remind_at }}
            </p>
          </div>

          <div>
            <label class="block mb-1 font-semibold">Horário</label>
            <input type="time" v-model="time" class="w-full border p-2 rounded-lg" />
          </div>

          <div class="flex items-center gap-2">
            <button type="submit" :disabled="loading"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
              {{ loading ? 'Salvando...' : 'Salvar Lembrete' }}
            </button>
            <div class="relative group">
              <InformationCircleIcon class="w-5 h-5 text-blue-500 cursor-pointer" />
              <div
                class="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 text-sm bg-gray-800 text-white p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Para receber lembretes, ative as notificações no navegador e no sistema.
              </div>
            </div>
          </div>
        </form>
      </section>

      <section class="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col overflow-y-auto min-h-0">
        <h2 class="text-2xl font-semibold mb-4">Lembretes Cadastrados</h2>
        <div v-if="reminders.length" class="space-y-3">
          <div v-for="rem in reminders" :key="rem.id"
            class="p-3 bg-white rounded-lg shadow flex justify-between items-center">
            <div>
              <p class="font-medium">{{ rem.title }}</p>
              <p class="text-sm text-gray-600">
                {{ formatDate(rem.remind_at) }} às {{ formatTime(rem.remind_at) }}
              </p>
            </div>
            <button @click="openConfirm(rem.id)" class="text-red-500 hover:text-red-600">
              Excluir
            </button>
          </div>
        </div>
        <p v-else class="text-gray-500">Nenhum lembrete cadastrado.</p>
      </section>
    </main>

    <dialog ref="confirmDialog" class="rounded-2xl p-6 bg-white shadow-lg">
      <p class="text-lg mb-4">Deseja realmente excluir este lembrete?</p>
      <div class="flex justify-end gap-3">
        <button @click="cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
          Cancelar
        </button>
        <button @click="confirmDelete" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
          Excluir
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { sidebar } from '@/stores/menuSidebar'
import { ClipboardIcon, PaperClipIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'

const toast = useToast()
const menuStore = sidebar()
menuStore.removeAllMenuItems()
menuStore.addMenuItem({ label: 'Dashboard', icon: ClipboardIcon, route: '/Dashboard' })
menuStore.addMenuItem({ label: 'Nova Tarefa', icon: PaperClipIcon, route: '/NovaTarefa' })
menuStore.addMenuItem({ label: 'Nova Meta', icon: CheckCircleIcon, route: '/NovaMeta' })

const router = useRouter()
const store = useStore()

const loading = ref(false)
const form = reactive({ title: '', description: '' })
const errors = reactive({ title: '', remind_at: '' })
const selectedDate = ref(null)
const time = ref('00:00')

const today = new Date()
today.setHours(0, 0, 0, 0)
const disabledDatesArray = ref([{ end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) }])
const attributes = computed(() =>
  selectedDate.value
    ? [{ key: 'selected-date', dates: selectedDate.value, highlight: { backgroundColor: '#3b82f6', borderRadius: '50%' } }]
    : []
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
  selectedDate.value = date
}

const reminders = computed(() =>
  store.reminders
    .filter(rem => new Date(rem.remind_at) > new Date())
    .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at))
)

onMounted(async () => {
  await store.fetchReminders()
})

const isTimeInPast = () => {
  const selected = new Date(selectedDate.value)
  const [hours, minutes] = time.value.split(':')
  selected.setHours(hours, minutes, 0, 0)
  return selected < new Date()
}

const submitReminder = async () => {
  errors.title = ''
  errors.remind_at = ''
  if (!form.title.trim()) {
    toast.warning('O título é obrigatório.')
    return
  }
  if (!selectedDate.value) {
    toast.warning('Selecione uma data válida.')
    errors.remind_at = 'Selecione uma data válida.'
    return
  }
  if (isTimeInPast()) {
    toast.warning('O horário não pode estar no passado.')
    errors.remind_at = 'O horário não pode estar no passado.'
    return
  }
  try {
    loading.value = true
    await store.createReminder({ form, errors, selectedDate, time, loading, router })
    toast.success('Lembrete criado com sucesso!')
    form.title = ''
    form.description = ''
    selectedDate.value = null
    time.value = '00:00'
  } catch (err) {
    toast.error('Erro ao criar lembrete.')
    console.error('Erro ao criar lembrete:', err)
  } finally {
    loading.value = false
  }
}

// Referência ao dialog nativo e lógica de confirmação
const confirmDialog = ref(null)
const deletingId = ref(null)

function openConfirm(id) {
  deletingId.value = id
  confirmDialog.value.showModal()
}
function cancel() {
  confirmDialog.value.close()
  deletingId.value = null
}
async function confirmDelete() {
  try {
    await store.deleteReminder(deletingId.value)
    toast.success('Lembrete excluído com sucesso!')
  } catch (err) {
    toast.error('Erro ao excluir lembrete.')
    console.error('Erro ao excluir lembrete:', err)
  } finally {
    confirmDialog.value.close()
    deletingId.value = null
  }
}

const formatDate = (dt) =>
  new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
</script>
