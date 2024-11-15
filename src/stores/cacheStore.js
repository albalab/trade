// stores/cacheStore.js
import { defineStore } from 'pinia';

export const useCacheStore = defineStore({
    id: 'cacheStore',
    state: () => ({
        totalCountTrades: 0,
        tradesCountBuy: 0,
        tradesCountSell: 0,
        tradeHistory: [],
        tradeHistoryBuy: [],
        tradeHistorySell: [],
        tickerStats: {},
    }),
    persist: false, //true, // Включаем сохранение состояния в localStorage

    actions: {
        resetStore() {
            // Сбрасываем состояние в начальные значения
            this.$reset();
        },
    },
});
