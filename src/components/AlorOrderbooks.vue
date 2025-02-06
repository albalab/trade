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
import webSocketService from "@/services/webSocketService";

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

      const defaultValues = {
        sourceOrderbooksCount: 0,

        newOrderbooks: [],
        orderbooksMetrics: [],
        orderbooksStats: {},
        accumulatedOrderbooksStats: {},
        orderbooksCounter: {},
        orderbooksFixedArray: {}
      };

      const orderbooksStoreData = data.reduce((acc, item) => {
        if (item.type in defaultValues) {
          acc[item.type] = item.data || defaultValues[item.type];
        }
        return acc;
      }, { ...defaultValues });

      Object.assign(this.orderbooksStore, orderbooksStoreData);

    },

  },

  mounted() {
    webSocketService.connect();
    webSocketService.subscribe("aggregatedOrderbooks", this.handleOrderbooksUpdate);
  },

  unmounted() {
    webSocketService.close();
  },

};
</script>


