<template>
  <div>

  </div>
</template>

<script>


import { tickersSteps } from '../tickersSteps.js';

export default {
  name: 'alor-trades',
  
  data() {
    return {

      tradeCounter: 0,

      accumulatedTradeStats: {},
      tickerStats: {},

      tickersSteps,

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',


      trades: [],
      
    };
  },


  computed: {

    /*tradesStats() {
      return {
        tradesStats: this.tickerStats,
      }
    },*/

    tradesCounters() {
      return {
        tradesStats: this.sortedTradesStats,
        tradeCounter: this.tradeCounter,
        tradesCounters: this.sortedAccumulatedTradeStats, //this.tickerStats,
      }
    },

    groupedTrades() {
      return this.trades.reduce((acc, trade) => {
        const { ticker } = trade;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(trade);
        return acc;
      }, {});
    },
    sortedTrades() {
      return Object.entries(this.groupedTrades)
          .sort(([, a], [, b]) => b.length - a.length) // Сортировка по длине массивов
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
    },

    sortedTradesStats() {
      return Object.entries(this.groupedTrades)
        .sort(([, a], [, b]) => b.length - a.length)
        .reduce((acc, [key, value]) => {
          acc[key] = value.length;
          return acc;
        }, {});
    },

    sortedAccumulatedTradeStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedTradeStats).sort(([, a], [, b]) => b - a)
      );
    },

    marketSummary() {
      const summary = {};

      // Обработка данных сделок
      this.trades.forEach((trade) => {
        const { ticker, qty, side } = trade;

        summary[ticker] = summary[ticker] || {};

        summary[ticker].tradeVolumeAbsoluteRub = parseFloat(trade.price) * trade.qty;

        //summary[ticker].tradeLastPriceLevel = Math.round(price / this.tickersSteps[ticker]);

        summary[ticker].tradeVolume = qty;

        summary[ticker].tradeLastBuyVolume = (summary[ticker].buyVolume || 0) + (side === "buy" ? qty : 0);
        summary[ticker].tradeLastSellVolume = (summary[ticker].sellVolume || 0) + (side === "sell" ? qty : 0);

        Object.entries(trade).forEach(([key, value]) => {
          const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          summary[ticker][`trade${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`] = value;
        });

        //console.log(trade);

      });

      return summary;
    },

  },

  methods: {

    emitTradesCounters() {
      setTimeout(() => {
        this.$emit('update-trades-counters', this.tradesCounters);
        this.emitTradesCounters();
      }, 200);
    },

    updateAccumulatedTradeStats(trades) {
      const stats = { ...this.accumulatedTradeStats };

      trades.forEach((trade) => {
        const { ticker } = trade;
        stats[ticker] = (stats[ticker] || 0) + 1;
      });

      this.accumulatedTradeStats = stats;
    },

    selectTicker(ticker){
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },

    emitTrades() {
      setTimeout(() => {
        this.$emit('update-trades-summary', this.marketSummary);
        this.emitTrades();
      }, 200);
    },

    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/trades/');
      socket.onmessage = (event) => {
        const trades = JSON.parse(event.data);
        if (!Array.isArray(trades)) return;

        this.updateAccumulatedTradeStats(trades);
        
        this.$emit('update-trades', trades);

        const tickerStats = { ...this.tickerStats };
        let localTrades = [...this.trades];
        let tradeCounter = this.tradeCounter;

        trades.forEach(trade => {

          if (tickerStats[trade.ticker]) {
            tickerStats[trade.ticker]++;
          } else {
            tickerStats[trade.ticker] = 1;
          }

          tradeCounter++;

          localTrades.push(trade);
        });

        if (localTrades.length > 200) localTrades.splice(0, localTrades.length - 200);
        this.trades = localTrades;

        this.tradeCounter = tradeCounter;
        this.tickerStats = tickerStats;

      };
    },

  },

  mounted() {
    this.connectToWebSocket();
    this.emitTrades();
    this.emitTradesCounters();
  },

};
</script>

