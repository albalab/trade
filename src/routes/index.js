import { createRouter, createWebHashHistory } from 'vue-router';

// Определяем маршруты
const routes = [
    {
        path: '/alorcandles',
        component: () => import('../components/AlorCandles.vue')
    },
    {
        path: '/test',
        component: () => import('../components/TestView.vue')
    },
];

// Создаем роутер
const router = createRouter({
    history: createWebHashHistory(), // Используем hash history
    routes,
});

// Экспортируем роутер
export default router;
