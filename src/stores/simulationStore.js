import { defineStore } from "pinia";

export const useSimulationStore = defineStore("simulation", {
    state: () => ({
        initialPrice: 10000,
        currentPrice: 10000,
        priceStart: 10000,
        priceStep: 1,
        priceStepMultiplier: 10,
        gridStep: 20,
        takeProfitDistance: 20,
        levelsCount: 3,
        volume: 10,
        volatility: 1,
        interval: 10,
        enableRestore: true,
        restoreCount: 300,
        enableGridShift: true,
        gridShiftIntervals: [2000, 3000, 7000],
        enableTpShift: false,
        maxOpenTrades: 10,
        // Остальное состояние:
        buyLevels: [],
        sellOrders: [],
        openTrades: [],
        priceData: [],
        remainingRestoreCount: 300,
        closedTrades: [],
        totalProfit: 0,

        timeIndex: 0,
        buyPoints: [],
        sellPoints: [],
    }),
    actions: {
        setConfig(key, value) {
            this[key] = value;
        },
        resetRemainingRestoreCount() {
            this.remainingRestoreCount = this.restoreCount;
        },
    },
});
