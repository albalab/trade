import { createRouter, createWebHashHistory } from 'vue-router';

// Определяем маршруты
const routes = [
    {
        path: '/alorcandles',
        component: () => import('../components/AlorCandles.vue')
    },
    {
        path: '/alortrades',
        component: () => import('../components/AlorTrades.vue')
    },
    {
        path: '/tcscandles',
        component: () => import('../components/TcsCandles.vue')
    },
    {
        path: '/tcstrades',
        component: () => import('../components/TcsTrades.vue')
    },
];

// Создаем роутер
const router = createRouter({
    history: createWebHashHistory(), // Используем hash history
    routes,
});

// Экспортируем роутер
export default router;
