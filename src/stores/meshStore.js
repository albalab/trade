import { defineStore } from "pinia";

export const useMeshStore = defineStore("mesh", {
    state: () => ({
        buyLevels: [],
        sellOrders: [],
        openTrades: [],
        priceData: [],

        remainingRestoreCount: 0,
        currentPrice: 100,
        simulationId: null,
        timeIndex: 0,

        closedTrades: [],
        totalProfit: 0,

        linesData: [],

        buyPoints: [],
        sellPoints: [],
    }),
    actions: {
        addTrade(trade) {
            this.openTrades.push(trade);
        },
        /*resetState() {
            this.buyLevels = [];
            this.sellOrders = [];
            this.openTrades = [];
            this.priceData = [];

            this.remainingRestoreCount = 0;
            this.currentPrice = 100;
            this.simulationId = null;
            this.timeIndex = 0;

            this.buyLevels = [];
            this.sellOrders = [];
            this.openTrades = [];
            this.closedTrades = [];
            this.totalProfit = 0;

            this.priceData = [];
            this.linesData = [];

            this.buyPoints = [];
            this.sellPoints = [];

        },*/
    },
});


/*meshStore:{
      remainingRestoreCount: 0,
      currentPrice: 100,
      simulationId: null,
      timeIndex: 0,

      buyLevels: [],
      sellOrders: [],
      openTrades: [],
      closedTrades: [],
      totalProfit: 0,

      priceData: [],
      linesData: [],

      // Точки входа/выхода для графика
      buyPoints: [],
      sellPoints: [],
    },*/