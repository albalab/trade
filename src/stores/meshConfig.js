import { defineStore } from "pinia";

export const useMeshConfigStore = defineStore("meshConfig", {
    state: () => ({
        config: {
            priceStart: 100,
            gridStep: 2,
            levelsCount: 3,
            volume: 10,
            takeProfitDistance: 1,
            volatility: 1,
            interval: 10,
            enableRestore: true,
            restoreCount: 300,
            enableGridShift: true,
            gridShiftIntervals: [2000, 3000, 7000],
            enableTpShift: false,
            maxOpenTrades: 10,
        },
    }),
    actions: {
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
        },
    },
    persist: true, // Настройки сохраняются в localStorage
});
