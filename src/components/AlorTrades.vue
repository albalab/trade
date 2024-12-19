<template>
  <div>

    <StatisticRenderer
        :items="tradesStore.newTrades"
    />


    <LevelsRenderer
        :levelsStats="tradesStore.levelsStats"
    />

    <!--    {{historyTickers}}<br>
        {{tradeCounter}}<br>
        F: {{trades[0]?.tickerFrequency}}-->
  </div>
</template>

<script>

import { useTradesStore } from '@/stores/tradesStore';

import StatisticRenderer from "./StatisticRenderer.vue";
import { tickersSteps } from '../tickersSteps.js';
import LevelsRenderer from "./LevelsRenderer.vue";
import webSocketService from "@/services/WebSocketService";

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

      historyTickers: {
        'GAZP': [],
        'LKOH': [],
        'SBER': [],
      }
    };
  },


  computed: {

  },

  methods: {

    handleTradesUpdate(data){

      //const newTrades = data.filter(item => item.type === 'trade');


      //const tickerStats = { ...this.tickerStats };
      /*let localTrades = [...this.trades];

      let localTradeCounterBuy = this.tradeCounterBuy;
      let localTradeCounterSell = this.tradeCounterSell;
      let localTradeCounter = this.tradeCounter;*/

      /*newTrades.forEach(trade => {

        /!*if (tickerStats[trade.ticker]) {
          tickerStats[trade.ticker]++;
        } else {
          tickerStats[trade.ticker] = 1;
        }*!/

        localTradeCounter++;
        if (trade.side === 'buy') {
          localTradeCounterBuy++;
        } else if (trade.side === 'sell') {
          localTradeCounterSell++;
        }

        localTrades.push(trade);

        if (localTrades.length > 500) {
          localTrades.shift();
        }

      });
*/
      /*this.trades = localTrades;

      this.tradeCounterBuy = localTradeCounterBuy;
      this.tradeCounterSell = localTradeCounterSell;
      this.tradeCounter = localTradeCounter;*/

      const newTrades = data.find((item) => item.type === "newTrades").data || [];
      const tradesMetrics = data.find((item) => item.type === "tradesMetrics").data || [];
      const sortedTradesStats = data.find((item) => item.type === "sortedTradesStats").data || [];
      const levelsStats = data.find((item) => item.type === "globalLevelsStats").data || [];
      const tradesStatistics = data.find((item) => item.type === "tradesStatistics").data || [];
      const accumulatedTradesStats = data.find((item) => item.type === "accumulatedTradesStats").data || {};
      const tickerStats = data.find((item) => item.type === "tickerStats")?.data || {};
      const tickerFrequency = data.find((item) => item.type === "tickerFrequency")?.data || {};
      const tickerFrequencyBuy = data.find((item) => item.type === "tickerFrequencyBuy")?.data || {};
      const tickerFrequencySell = data.find((item) => item.type === "tickerFrequencySell")?.data || {};

      this.tradesStore.newTrades = newTrades;
      this.tradesStore.tradesStats = sortedTradesStats;
      this.tradesStore.tradesMetrics = tradesMetrics;
      this.tradesStore.levelsStats = levelsStats;
      this.tradesStore.tradesStatistics = tradesStatistics;
      this.tradesStore.accumulatedTradesStats = accumulatedTradesStats;
      this.tradesStore.tickerStats = tickerStats;
      this.tradesStore.tickerFrequency = tickerFrequency;
      this.tradesStore.tickerFrequencyBuy = tickerFrequencyBuy;
      this.tradesStore.tickerFrequencySell = tickerFrequencySell;

    },

  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedTrades", this.handleTradesUpdate);
  },

};
</script>

