import { createRouter, createWebHistory } from 'vue-router';
import count from '../views/Count.vue';
import login from '../views/Login.vue';
import cadastro from '../views/Cadastro.vue';
import resetsenha from '../views/ResetSenha.vue';
import dashboard from '../views/Dashboard.vue';
import { useStore } from '@/stores'


const routes = [
  {
    path: '/',
    name: 'Login',
    component: login,
  },
  {
    path: '/ResetSenha',
    name: 'resetsenha',
    component: resetsenha,
  },
  {
    path: '/Cadastro',
    name: 'Cadastro',
    component: cadastro,
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    component: dashboard,
    meta: {requiresAuth: true},
  },
  {
    path: '/count',
    name: 'count',
    component: count,
    meta: {requiresAuth: true},
  },

];

let hasClicked = false;

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from) => {
  const store = useStore()

  if (to.meta.requiresAuth && !store.user) {
    return { name: 'Login' }
  }

  if ((to.name === '/' || to.name === '/Cadastro') && store.user) {
    return { name: 'Dashboard' }
  }
})

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
