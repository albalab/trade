<template>
  <div>

  </div>
</template>

<script>
import { useCandlesStore } from '@/stores/candlesStore';

import { tickers, tickersSteps } from "@/tickers";
import webSocketService from "@/services/webSocketService";

export default {
  name: "alor-candles",

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
        sourceCandlesCount: {},
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

  unmounted() {
    webSocketService.close();
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
