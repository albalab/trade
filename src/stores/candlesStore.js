import { defineStore } from 'pinia';

export const useCandlesStore = defineStore('candles', {
    state: () => ({
        newCandles: [],
        sortedCandlesStats: {},
        accumulatedCandlesStats: {},
        candlesStats: {},
        candleCounter: 0,

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
