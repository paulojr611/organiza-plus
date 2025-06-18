import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/router";
import VCalendar from "v-calendar";
import "v-calendar/style.css";
import "./index.css";
import axios from "axios";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

axios.defaults.baseURL = "http://localhost:8000";

const app = createApp(App);
const pinia = createPinia();

app.use(createPinia());
app.use(pinia);
app.use(router);
app.use(VCalendar, {
    componentPrefix: "vc",
});
app.mount("#app");

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

app.use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
});

