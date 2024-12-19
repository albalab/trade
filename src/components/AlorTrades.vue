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

    tradesCounters() {
      return {
        tradeCounter: this.tradeCounter,
        tradeCounterBuy: this.tradeCounterBuy,
        tradeCounterSell: this.tradeCounterSell,
      }
    },

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

      const newTrades = data.filter((item) => item.type === "newTrades");
      const tradesMetrics = data.filter(item => item.type === 'tradesMetrics');
      const sortedTradesStats = data.filter(item => item.type === 'sortedTradesStats');
      const levelsStats = data.filter(item => item.type === 'globalLevelsStats');
      const tradesStatistics = data.filter(item => item.type === 'tradesStatistics');
      const accumulatedTradesStats = data.find((item) => item.type === "accumulatedTradesStats");
      const tickerStats = data.find(item => item.type === 'tickerStats')?.data || {};
      const tickerFrequency = data.find(item => item.type === 'tickerFrequency')?.data || {};

      this.tradesStore.newTrades = newTrades[0].data;
      this.tradesStore.tradesStats = sortedTradesStats[0].data;
      this.tradesStore.tradesMetrics = tradesMetrics[0].data;
      this.tradesStore.levelsStats = levelsStats[0].data;
      this.tradesStore.tradesStatistics = tradesStatistics[0].data;
      this.tradesStore.accumulatedTradesStats = accumulatedTradesStats.data;
      this.tradesStore.tickerStats = tickerStats;
      this.tradesStore.tickerFrequency = tickerFrequency;

    },

  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedTrades", this.handleTradesUpdate);
  },

};
</script>

