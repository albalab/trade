<template>
  <div>

    <StatisticRenderer
        :items="tradesStore.newTrades"
    />


    <LevelsRenderer :levelsStats="tradesStore.levelsStats" />

  </div>
</template>

<script>

import { useTradesStore } from '@/stores/tradesStore';

import StatisticRenderer from "./StatisticRenderer.vue";
import { tickersSteps } from '../tickersSteps.js';
import LevelsRenderer from "./LevelsRenderer.vue";
import webSocketService from "@/services/webSocketService";

export default {
  name: 'alor-trades',
  components: {
    StatisticRenderer,
    LevelsRenderer
  },

  setup() {
    const tradesStore = useTradesStore();
    return { tradesStore }
  },

  data() {
    return {

      tradeCounter: 0,
      tradeCounterBuy: 0,
      tradeCounterSell: 0,

      accumulatedTradeStats: {},
      //tickerStats: {},

      tickersSteps,

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',


      trades: [],

    };
  },


  computed: {

  },

  methods: {

    handleTradesUpdate(data){

      const defaultValues = {
        sourceTradesCount: 0,
        newTrades: [],
        tradesMetrics: [],
        tradesStats: [],
        levelsStats: [],
        tradesStatistics: [],
        accumulatedTradesStats: {},
        tickerStats: {},
        tickerFrequency: {},
        tickerFrequencyBuy: {},
        tickerFrequencySell: {}
      };

      const tradesStoreData = data.reduce((acc, item) => {
        if (item.type in defaultValues) {
          acc[item.type] = item.data || defaultValues[item.type];
        }
        return acc;
      }, { ...defaultValues });

      Object.assign(this.tradesStore, tradesStoreData);

    },

  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedTrades", this.handleTradesUpdate);
  },

  unmounted() {
    webSocketService.close();
  }

};
</script>

