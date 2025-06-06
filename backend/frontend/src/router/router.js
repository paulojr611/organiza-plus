import { createRouter, createWebHistory } from "vue-router";
import login from "../views/Login.vue";
import cadastro from "../views/Cadastro.vue";
import resetsenha from "../views/ResetSenha.vue";
import dashboard from "../views/Dashboard.vue";
import novatarefa from "../views/NovaTarefa.vue";
import naoencontrada from "../views/NaoEncontrada.vue";
import novameta from "../views/NovaMeta.vue";
import { useStore } from "@/stores";

const routes = [
    {
        path: "/",
        name: "Login",
        component: login,
    },
    {
        path: "/ResetSenha",
        name: "ResetSenha",
        component: resetsenha,
    },
    {
        path: "/Cadastro",
        name: "Cadastro",
        component: cadastro,
    },
    {
        path: "/Dashboard",
        name: "Dashboard",
        component: dashboard,
        meta: { requiresAuth: true },
    },
    {
        path: "/NovaTarefa",
        name: "NovaTarefa",
        component: novatarefa,
        meta: { requiresAuth: true },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NaoEncontrada",
        component: naoencontrada,
        meta: { layout: "public" },
    },
    {
        path: "/NovaMeta",
        name: "NovaMeta",
        component: novameta,
        meta: { requiresAuth: true },
    },
];

let hasClicked = false;

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from) => {
    const store = useStore();

    if (to.meta.requiresAuth && !store.user) {
        return { name: "Login" };
    }

    if ((to.name === "/" || to.name === "/Cadastro") && store.user) {
        return { name: "Dashboard" };
    }
});

/*router.beforeEach((to, from, next) => {
  if (to.meta.requiresClick && !hasClicked) {
    console.warn('Acesso bloqueado: requer clique antes de acessar.');
    return next(false); 
  }
  next();
});*/

export const setClickAccess = () => {
    hasClicked = true;
};

export default router;
