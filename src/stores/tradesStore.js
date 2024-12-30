import { defineStore } from 'pinia';

export const useTradesStore = defineStore('trades', {
    // Состояние (state)
    state: () => ({
        sourceTradesCount: 0,
        count: 0,
        newTrades: {},
        tradesMetrics: {},
        levelsStats: {},
        tradesStatistics: {},
        totalItemsStats: {},
        tradesStats: {},
        tickerFrequency: {},
        tickerStats: {},

    }),

    /*// Геттеры (getters)
    getters: {
        doubleCount: (state) => state.count * 2,
    },
*/
    // Действия (actions)
    /*actions: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
    },*/
});
