import { defineStore } from 'pinia';

export const useDataFabricStore = defineStore('dataFabric', {
    state: () => ({
        sourceCounts: {},
        aggregatedEvents: {},
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
