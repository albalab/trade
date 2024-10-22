import { createRouter, createWebHashHistory } from 'vue-router';

// Определяем маршруты
const routes = [
    {
        path: '/alorcandles',
        component: () => import('../components/AlorCandles.vue'),
        meta: { requireAuth: false }, // Мета-данные, если нужно
    },
];

// Создаем роутер
const router = createRouter({
    history: createWebHashHistory(), // Используем hash history
    routes,
});

// Экспортируем роутер
export default router;
