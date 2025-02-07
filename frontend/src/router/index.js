import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AlumniView from '../views/AlumniView.vue'
import EventsView from '../views/EventsView.vue'
import JobsView from '../views/JobsView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/alumni',
      name: 'alumni',
      component: AlumniView
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: JobsView
    }
  ]
})

export default router
