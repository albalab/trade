import { createRouter, createWebHashHistory } from 'vue-router';

// Определяем маршруты
const routes = [
    {
        path: '/alorcandles',
        component: () => import('../components/AlorCandles.vue')
    },
    {
        path: '/tcscandles',
        component: () => import('../components/TcsCandles.vue')
    },
];

// Создаем роутер
const router = createRouter({
    history: createWebHashHistory(), // Используем hash history
    routes,
});

// Экспортируем роутер
export default router;
