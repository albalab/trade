import { defineStore } from 'pinia';

export const useQuotesStore = defineStore('quotes', {
    state: () => ({
        sourceQuotesCount: 0,
        newQuotes: {},
        sortedQuotesStats: {},
        accumulatedQuotesStats: {},
        quotesStats: {},
        quotesCounter: 0,

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
