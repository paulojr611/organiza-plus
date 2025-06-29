import { createRouter, createWebHistory } from "vue-router";
import login from "../views/Login.vue";
import cadastro from "../views/Cadastro.vue";
import resetsenha from "../views/ResetSenha.vue";
import dashboard from "../views/Dashboard.vue";
import novatarefa from "../views/NovaTarefa.vue";
import naoencontrada from "../views/NaoEncontrada.vue";
import novameta from "../views/NovaMeta.vue";
import novolembrete from "../views/NovoLembrete.vue";
import convite from "../views/Convite.vue";
import { useStore } from "@/stores";

const routes = [
    {
        path: "/",
        name: "Convite",
        component: convite,
        meta: { layout: "public" },
    },
    {
        path: "/login",
        name: "Login",
        component: login,
        meta: { layout: "public" },
    },
    {
        path: "/resetsenha",
        name: "ResetSenha",
        component: resetsenha,
        meta: { layout: "public" },
    },
    {
        path: "/cadastro",
        name: "Cadastro",
        component: cadastro,
        meta: { layout: "public" },
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        component: dashboard,
        meta: { requiresAuth: true },
    },
    {
        path: "/novatarefa",
        name: "NovaTarefa",
        component: novatarefa,
        meta: { requiresAuth: true },
    },
    {
        path: "/novameta",
        name: "NovaMeta",
        component: novameta,
        meta: { requiresAuth: true },
    },
    {
        path: "/novolembrete",
        name: "NovaLembrete",
        component: novolembrete,
        meta: { requiresAuth: true },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NaoEncontrada",
        component: naoencontrada,
        meta: { layout: "public" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const store = useStore();

    const token = localStorage.getItem("api_token");
    const userJson = localStorage.getItem("user");
    if (token && !store.user) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        store.user = JSON.parse(userJson);
    }

    if (to.meta.requiresAuth && !store.user) {
        return { name: "Login" };
    }

    const publicPages = ["Convite", "Login", "Cadastro", "ResetSenha"];
    if (publicPages.includes(to.name) && store.user) {
        return { name: "Dashboard" };
    }

    return true;
});

export default router;
