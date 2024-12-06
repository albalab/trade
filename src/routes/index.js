import { createRouter, createWebHashHistory } from 'vue-router';

// Определяем маршруты
const routes = [
    {
        path: '/mergedcomponent',
        component: () => import('../components/MergedComponent.vue')
    },
    {
        path: '/alororderbooks',
        component: () => import('../components/AlorOrderbooks.vue')
    },

    {
        path: '/alorcandles',
        component: () => import('../components/AlorCandles.vue')
    },
    {
        path: '/alorquotes',
        component: () => import('../components/AlorQuotes.vue')
    },
    {
        path: '/alortrades',
        component: () => import('../components/AlorTrades.vue')
    },
    {
        path: '/alortradesplus',
        component: () => import('../components/AlorTradesPlus.vue')
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
