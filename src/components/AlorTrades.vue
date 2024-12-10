<template>
  <div>

    <StatisticRenderer
        :items="newTrades"
    />


    <LevelsRenderer
        :levelsStats="levelsStats"
        :items="newTrades"
    />


    <!--    {{historyTickers}}<br>
        {{tradeCounter}}<br>
        F: {{trades[0]?.tickerFrequency}}-->
  </div>
</template>

<script>
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
  
  data() {
    return {

      newTrades: [],
      levelsStats: {},

      tradesSummary: {},
      groupedTrades: {},
      sortedTradesStats: {},
      tradesStatistics: {},

      tradeCounter: 0,
      tradeCounterBuy: 0,
      tradeCounterSell: 0,

      accumulatedTradeStats: {},
      tickerStats: {},

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
        tradesStats: this.sortedTradesStats,
        tradeCounter: this.tradeCounter,
        tradeCounterBuy: this.tradeCounterBuy,
        tradeCounterSell: this.tradeCounterSell,
        tradesCounters: this.sortedAccumulatedTradeStats,
      }
    },

    /*groupedTrades() {
      return this.trades.reduce((acc, trade) => {
        const { ticker } = trade;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(trade);
        return acc;
      }, {});
    },*/

    /*sortedTradesStats() {
      return Object.entries(this.groupedTrades)
        .sort(([, a], [, b]) => b.length - a.length)
        .reduce((acc, [key, value]) => {
          acc[key] = value.length;
          return acc;
        }, {});
    },*/

    sortedAccumulatedTradeStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedTradeStats).sort(([, a], [, b]) => b - a)
      );
    },

   /* marketSummary() {
      const metrics = {};

      this.trades.forEach((trade) => {
        const { ticker, qty } = trade;

        metrics[ticker] = metrics[ticker] || {};
        metrics[ticker].tradeVolumeAbsoluteRub = parseFloat(trade.price) * trade.qty;
        metrics[ticker].tradeVolume = qty;

        Object.entries(trade).forEach(([key, value]) => {
          const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          metrics[ticker][`trade${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`] = value;
        });

      });
      return metrics;
    },*/

  },

  methods: {

    /*tickerFrequency(trades) {

      if (!Array.isArray(trades)) {
        console.error("trades должен быть массивом, но получил:", trades);
        return;
      }

      return trades.reduce((acc, trade) => {
        const ticker = trade.ticker;
        acc[ticker] = (acc[ticker] || 0) + 1;
        return acc;
      }, {});
    },*/

    handleTradesUpdate(data){


      const newTrades = data.filter(item => item.type === 'trade');
      const tradesMetrics = data.filter(item => item.type === 'tradesMetrics');
      const groupedTrades = data.filter(item => item.type === 'groupedTrades');
      const sortedTradesStats = data.filter(item => item.type === 'sortedTradesStats');
      const levelsStats = data.filter(item => item.type === 'globalLevelsStats');
      const tradesStatistics = data.filter(item => item.type === 'tradesStatistics');

      //console.log(newTrades);

      this.sortedTradesStats = sortedTradesStats.length ? sortedTradesStats[0].data : {}
      this.groupedTrades = groupedTrades.length ? groupedTrades[0].data : {}
      this.tradesMetrics = tradesMetrics.length ? tradesMetrics[0].data : {}
      this.levelsStats = levelsStats.length ? levelsStats[0].data : {};
      this.tradesStatistics = tradesStatistics.length ? tradesStatistics[0].data : {};

      //console.log(groupedTrades);

      this.updateAccumulatedTradeStats(newTrades);

      const tickerStats = { ...this.tickerStats };
      let localTrades = [...this.trades];

      let localTradeCounterBuy = this.tradeCounterBuy;
      let localTradeCounterSell = this.tradeCounterSell;
      let localTradeCounter = this.tradeCounter;

      newTrades.forEach(trade => {

        if (tickerStats[trade.ticker]) {
          tickerStats[trade.ticker]++;
        } else {
          tickerStats[trade.ticker] = 1;
        }

        localTradeCounter++;
        if (trade.side === 'buy') {
          localTradeCounterBuy++;
        } else if (trade.side === 'sell') {
          localTradeCounterSell++;
        }

        localTrades.push(trade);

        //console.log(trade);

        if (localTrades.length > 500) {
          localTrades.shift();

          /*const tickerFrequency = this.tickerFrequency(localTrades);
          const tickerFrequencyBuy = this.tickerFrequency(localTrades.filter(i=>i.side==='buy'));
          const tickerFrequencySell = this.tickerFrequency(localTrades.filter(i=>i.side==='sell'));
          localTrades.forEach(item => {
            item.tickerFrequency = tickerFrequency[item.ticker];
            item.tickerFrequencyBuy = tickerFrequencyBuy[item.ticker];
            item.tickerFrequencySell = tickerFrequencySell[item.ticker];
          });*/

        }

      });

      //console.log('Buy', this.calculateBuyTotalByTicker(localTrades));
      //console.log('Sell', this.calculateSellTotalByTicker(localTrades));

      this.trades = localTrades;

      this.tradeCounterBuy = localTradeCounterBuy;
      this.tradeCounterSell = localTradeCounterSell;
      this.tradeCounter = localTradeCounter;

      this.tickerStats = tickerStats;

      this.newTrades = newTrades;
      this.$emit('update-trades', newTrades);
      this.$emit('update-trades-metrics', this.tradesMetrics);
      this.$emit('update-trades-counters', this.tradesCounters);
      this.$emit('update-levels-stats', this.levelsStats);
      this.$emit('update-trades-statistics', this.tradesStatistics);

    },

    updateAccumulatedTradeStats(trades) {
      const stats = { ...this.accumulatedTradeStats };

      trades.forEach((trade) => {
        const { ticker } = trade;
        stats[ticker] = (stats[ticker] || 0) + 1;
      });

      this.accumulatedTradeStats = stats;
    },

    /*connectToWebSocket() {
      const socket = new WebSocket('wss://signalfabric.com/datastream/');
      socket.onmessage = (event) => {

        let data = JSON.parse(event.data);
        data = data?.aggregatedTrades;
        //console.log(data);

        if (!Array.isArray(data)) this.handleTradesUpdate(data);


      };
    },*/

  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedTrades", this.handleTradesUpdate);
    //this.connectToWebSocket();
  },

};
</script>

