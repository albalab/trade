<template>
  <div>
    Total Candles: {{candlesStore.candleCounter}}<br>
    <StatisticRenderer v-if="candlesStore.newCandles" :items="candlesStore.newCandles" />
  </div>
</template>

<script>
import { useCandlesStore } from '@/stores/candlesStore';
import StatisticRenderer from "@/components/StatisticRenderer.vue";
import { tickers, tickersSteps } from "@/tickers";
import webSocketService from "@/services/WebSocketService";

export default {
  name: "alor-candles",

  components: { StatisticRenderer },

  setup() {
    const candlesStore = useCandlesStore();
    return { candlesStore }
  },

  data() {
    return {

      candles: [],
      newCandles: [],

      candlesMetrics: {},

      maxLength: 100,

      // Импортированные значения
      tickers,
      tickersSteps,
    };
  },
  computed: {

  },
  methods: {


    handleCandlesUpdate(data) {

      const newCandles = data.filter((item) => item.type === "newCandles");
      const collectedClosePrice = data.find((item) => item.type === "collectedClosePrice");
      const candlesMetrics = data.find((item) => item.type === "candlesMetrics");
      const candlesStats = data.find((item) => item.type === "candlesStats");
      const accumulatedCandlesStats = data.find((item) => item.type === "accumulatedCandlesStats");
      const candlesCounter = data.find((item) => item.type === "candlesCounter");
      const itemsFixedArray = data.find((item) => item.type === "itemsFixedArray");

      this.candlesStore.newCandles = newCandles[0].data;
      this.candlesStore.candlesMetrics = candlesMetrics.data;
      this.candlesStore.collectedClosePrice = collectedClosePrice.data;
      this.candlesStore.accumulatedCandlesStats = accumulatedCandlesStats.data;
      this.candlesStore.candlesStats = candlesStats.data;
      this.candlesStore.candlesFixedArray = itemsFixedArray.data;
      this.candlesStore.candlesCounter = candlesCounter.data;

      //console.log(accumulatedCandlesStats.data)
      //if (newCandles) this.newCandles = newCandles;

    },
  },
  mounted() {
    webSocketService.connect();
    webSocketService.subscribe("aggregatedCandles", this.handleCandlesUpdate);
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
