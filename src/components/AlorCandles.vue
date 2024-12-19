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

      const defaultValues = {
        newCandles: {},
        collectedClosePrice: {},
        candlesMetrics: {},
        candlesStats: {},
        accumulatedCandlesStats: {},
        candlesCounter: {},
        candlesFixedArray: {}
      };

      const candlesStoreData = data.reduce((acc, item) => {
        if (item.type in defaultValues) {
          acc[item.type] = item.data || defaultValues[item.type];
        }
        return acc;
      }, { ...defaultValues });

      Object.assign(this.candlesStore, candlesStoreData);

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
