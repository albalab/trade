import { defineStore } from "pinia";

export const useMeshStore = defineStore("mesh", {
    state: () => ({
        buyLevels: [],
        sellOrders: [],
        openTrades: [],
        priceData: [],

        remainingRestoreCount: 0,

        closedTrades: [],
        totalProfit: 0,

    }),

});