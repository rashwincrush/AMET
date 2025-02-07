import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
    history: createWebHistory('/alumni-management-saas/'),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue')
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
        }
    ]
});
export default router;
//# sourceMappingURL=index.js.map