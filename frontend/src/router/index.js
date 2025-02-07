import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue')
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('../views/AboutView.vue')
    },
    {
        path: '/alumni',
        name: 'alumni',
        component: () => import('../views/AlumniView.vue')
    },
    {
        path: '/events',
        name: 'events',
        component: () => import('../views/EventsView.vue')
    },
    {
        path: '/jobs',
        name: 'jobs',
        component: () => import('../views/JobsView.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/RegisterView.vue')
    }
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
export default router;
//# sourceMappingURL=index.js.map