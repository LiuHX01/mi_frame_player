import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: '/',
        name: 'App',
        component: () => import('../App.vue'),
    },
    {
        path: '/worker',
        name: 'Worker',
        component: () => import('../../worker.js'),
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router     