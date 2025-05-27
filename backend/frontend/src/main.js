import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import './index.css'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VCalendar, {
  componentPrefix: 'vc'
})
app.mount('#app')
