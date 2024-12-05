<template>
  <div>
    <StatisticRenderer :items="newCandles" />
  </div>
</template>

<script>
import StatisticRenderer from "@/components/StatisticRenderer.vue";
import { tickers, tickersSteps } from "@/tickers";

export default {
  name: "alor-candles",
  components: { StatisticRenderer },
  data() {
    return {
      // Основные данные
      candles: [],
      newCandles: [],
      accumulatedCandleStats: {},
      tickerStats: {},
      collectedClosePrice: {},

      // Сводная информация
      candlesSummary: {},
      groupedCandles: {},
      sortedCandlesStats: {},

      // Параметры
      candleCounter: 0,
      maxLength: 100,

      // Импортированные значения
      tickers,
      tickersSteps,
    };
  },
  computed: {
    candlesCounters() {
      return {
        candlesStats: this.sortedCandlesStats,
        candleCounter: this.candleCounter,
        candlesCounters: this.sortedAccumulatedCandleStats,
      };
    },
    sortedAccumulatedCandleStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedCandleStats).sort(([, a], [, b]) => b - a)
      );
    },
  },
  methods: {
    processNewCandles(newCandles) {
      const accumulatedStats = { ...this.accumulatedCandleStats };

      newCandles.forEach((candle) => {
        const { ticker, close } = candle;

        // Обновление статистики
        accumulatedStats[ticker] = (accumulatedStats[ticker] || 0) + 1;

        // Обновление массива свечей
        if (!this.collectedClosePrice[ticker]) {
          this.collectedClosePrice[ticker] = [];
        }
        this.collectedClosePrice[ticker].push(close);

        if (this.collectedClosePrice[ticker].length > this.maxLength) {
          this.collectedClosePrice[ticker] = this.collectedClosePrice[ticker].slice(-this.maxLength);
        }
      });

      this.accumulatedCandleStats = accumulatedStats;
    },

    handleWebSocketMessage(data) {
      const newCandles = data.filter((item) => item.type === "candle");
      const candlesSummary = data.find((item) => item.type === "candlesSummary");
      const groupedCandles = data.find((item) => item.type === "groupedCandles");
      const sortedCandlesStats = data.find((item) => item.type === "sortedCandlesStats");

      if (candlesSummary) this.candlesSummary = candlesSummary.data || {};
      if (groupedCandles) this.groupedCandles = groupedCandles.data || {};
      if (sortedCandlesStats) this.sortedCandlesStats = sortedCandlesStats.data || {};

      if (Array.isArray(newCandles) && newCandles.length) {
        this.processNewCandles(newCandles);
        this.candles.push(...newCandles);

        if (this.candles.length > this.maxLength) {
          this.candles.splice(0, this.candles.length - this.maxLength);
        }

        this.newCandles = newCandles;
        this.candleCounter += newCandles.length;

        this.$emit("update-candles", newCandles);
        this.$emit("update-candles-counters", this.candlesCounters);
        this.$emit("update-candles-summary", this.candlesSummary);
      }
    },

    connectToWebSocket() {
      const socket = new WebSocket("wss://signalfabric.com/datastream/");

      socket.onmessage = (event) => {
        try {
          let data = JSON.parse(event.data);
          data = data?.aggregatedCandles;
          if (Array.isArray(data)) this.handleWebSocketMessage(data);
        } catch (error) {
          console.error("Failed to process WebSocket message:", error);
        }
      };

      socket.onopen = () => console.log("Connected to WebSocket");
      socket.onerror = (error) => console.error("WebSocket error:", error);
      socket.onclose = () => console.log("WebSocket connection closed");
    },
  },
  mounted() {
    this.connectToWebSocket();
  },
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
li {
  margin-bottom: 10px;
}
</style>
