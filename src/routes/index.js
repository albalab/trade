import { createRouter, createWebHashHistory } from 'vue-router';

// Определяем маршруты
const routes = [
    {
        path: '/chat',
        component: () => import('../widgets/ChatTemplate.vue')
    },
    {
        path: '/beacon2',
        component: () => import('../widgets/BeaconLanguage2.vue')
    },
    {
        path: '/beacon',
        component: () => import('../widgets/BeaconLanguage.vue')
    },
    {
        path: '/markov',
        component: () => import('../widgets/MarkovStockSimulation.vue')
    },
    {
        name: "meshbot",
        path: '/meshbot',
        component: () => import('../widgets/Meshbot/MeshbotManager.vue')
    },
    {
        path: '/meshbottemplate',
        component: () => import('../widgets/Meshbot/MeshbotTemplate.vue')
    },
    {
        path: '/grid',
        component: () => import('../components/WidgetGrid.vue')
    },
    {
        path: '/intervals',
        component: () => import('../widgets/IntervalsTemplate.vue')
    },
    {
        name: 'workspace',
        path: '/workspace',
        component: () => import('../components/WorkspaceComponent.vue')
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
