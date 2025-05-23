import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import './index.css'; 
import router from './router/router';


const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');