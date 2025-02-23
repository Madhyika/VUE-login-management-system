import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import TaskView from '../views/TaskView.vue';
import Profile from '../components/Profile.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/profile', component: Profile,  meta: { requiresAuth: true }  },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/tasks', component: TaskView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (to.meta.requiresAuth && !loggedInUser) {
    next('/login');
  } else {
    next();
  }
});

export default router;
