<template>
  <div>
    <StatisticRenderer
        :items="orderbooksStore.newOrderbooks"
    />
  </div>
</template>


<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';
import StatisticRenderer from "@/components/StatisticRenderer.vue";
import webSocketService from "@/services/WebSocketService";

export default {
  name: 'alor-order-book',

  components: {
    StatisticRenderer
  },

  setup() {
    const orderbooksStore = useOrderbooksStore();
    return { orderbooksStore }
  },

  data() {
    return {

      orderbooksMetrics: {},
      groupedOrderbooks: {},
      sortedOrderbooksStats: {},
      
      orderbookCounter: 0,

      tickersSteps,
      tickers,

      newOrderbooks: [],
      orderbooks: [],
      orderbookGlobalStats: tickers.reduce((obj, ticker) => ({ ...obj, [ticker]: 0 }), {}),
    };
  },

  computed: {

  },

  methods: {

    handleOrderbooksUpdate(data){

      const newOrderbooks = data.filter((item) => item.type === "newOrderbooks");
      const orderbooksMetrics = data.filter(item => item.type === 'orderbooksMetrics');
      const orderbooksStats = data.find((item) => item.type === "orderbooksStats");
      const accumulatedOrderbooksStats = data.find((item) => item.type === "accumulatedOrderbooksStats");
      const orderbooksCounter = data.find((item) => item.type === "orderbooksCounter");
      const itemsFixedArray = data.find((item) => item.type === "itemsFixedArray");

      this.orderbooksStore.newOrderbooks = newOrderbooks[0].data;

      this.orderbooksStore.orderbooksMetrics = orderbooksMetrics.data;
      this.orderbooksStore.accumulatedOrderbooksStats = accumulatedOrderbooksStats.data;
      this.orderbooksStore.orderbooksStats = orderbooksStats.data;
      this.orderbooksStore.orderbooksFixedArray = itemsFixedArray.data;
      this.orderbooksStore.orderbooksCounter = orderbooksCounter.data;

    },

  },

  mounted() {
    webSocketService.connect();
    webSocketService.subscribe("aggregatedOrderbooks", this.handleOrderbooksUpdate);
  },

};
</script>


