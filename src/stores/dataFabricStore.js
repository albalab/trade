import { defineStore } from 'pinia';

export const useDataFabricStore = defineStore('dataFabric', {
    state: () => ({
        sourceCounts: {},

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
