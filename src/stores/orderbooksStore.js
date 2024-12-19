import { defineStore } from 'pinia';

export const useOrderbooksStore = defineStore('orderbooks', {
    state: () => ({
        newOrderbooks: {},
        sortedOrderbooksStats: {},
        accumulatedOrderbooksStats: {},
        orderbooksStats: {},
        orderbooksCounter: 0,

        /*tradesMetrics: {},
        levelsStats: {},
        tradesStatistics: {},
        totalItemsStats: {},
        tradesStats: {},
        tickerFrequency: {},
        tickerStats: {},
*/
    }),

});
