<template>
  <div>

    - Last Values oBestBidPrice[MTLR]: {{dataFabricStore.lastValues.data?.MTLR.oBestBidPrice}}<br>
    - Total: {{dataFabricStore.sourceCounts.sourceTotalCount}}<br>
    - Candles: {{dataFabricStore.sourceCounts.sourceCandlesCount}}<br>
    - Trades: {{dataFabricStore.sourceCounts.sourceTradesCount}}<br>
    - Orderbooks: {{dataFabricStore.sourceCounts.sourceOrderbooksCount}}<br>
    - Quotes: {{dataFabricStore.sourceCounts.sourceQuotesCount}}<br>
    - Aggregated events<br>
    - Chunk events<br>
  </div>
</template>

<script>
import { useDataFabricStore } from '@/stores/dataFabricStore';

//import { tickers, tickersSteps } from "@/tickers";
import webSocketService from "@/services/WebSocketService";

export default {
  name: "alor-data-fabric",

  

  setup() {
    const dataFabricStore = useDataFabricStore();
    return { dataFabricStore }
  },

  data() {
    return {

      /*candles: [],
      newCandles: [],

      candlesMetrics: {},

      maxLength: 100,

      // Импортированные значения
      tickers,
      tickersSteps,*/
    };
  },
  computed: {

  },
  methods: {

    handleUpdate(data) {
      const defaultValues = {
        sourceCounts: {},
        aggregatedEvents: {},
        chunkEvents: {},
        lastValues: {},
      };

      const dataFabricStoreData = data.reduce((acc, item) => {
        if (item.type in defaultValues) {
          acc[item.type] = item.data || defaultValues[item.type];
        }
        return acc;
      }, { ...defaultValues });

      Object.assign(this.dataFabricStore, dataFabricStoreData);

    },
  },
  mounted() {
    webSocketService.connect();
    webSocketService.subscribe("dataFabric", this.handleUpdate);
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
