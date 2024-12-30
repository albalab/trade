import { defineStore } from 'pinia';

export const useOrderbooksStore = defineStore('orderbooks', {
    state: () => ({
        sourceOrderbooksCount: 0,
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
