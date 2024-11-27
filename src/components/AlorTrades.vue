<template>
  <div>
<!--    {{historyTickers}}<br>
    {{tradeCounter}}<br>
    F: {{trades[0]?.tickerFrequency}}-->
  </div>
</template>

<script>


import { tickersSteps } from '../tickersSteps.js';

export default {
  name: 'alor-trades',
  
  data() {
    return {

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

      this.trades.forEach((trade) => {
        const { ticker, qty } = trade;

        summary[ticker] = summary[ticker] || {};
        summary[ticker].tradeVolumeAbsoluteRub = parseFloat(trade.price) * trade.qty;
        summary[ticker].tradeVolume = qty;

        Object.entries(trade).forEach(([key, value]) => {
          const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          summary[ticker][`trade${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`] = value;
        });

      });
      return summary;
    },

  },

  methods: {

    tickerFrequency(trades) {

      if (!Array.isArray(trades)) {
        console.error("trades должен быть массивом, но получил:", trades);
        return;
      }

      return trades.reduce((acc, trade) => {
        const ticker = trade.ticker;
        acc[ticker] = (acc[ticker] || 0) + 1;
        return acc;
      }, {});
    },

    updateAccumulatedTradeStats(trades) {
      const stats = { ...this.accumulatedTradeStats };

      trades.forEach((trade) => {
        const { ticker } = trade;
        stats[ticker] = (stats[ticker] || 0) + 1;
      });

      this.accumulatedTradeStats = stats;
    },

    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/trades/');
      socket.onmessage = (event) => {
        const newTrades = JSON.parse(event.data);
        if (!Array.isArray(newTrades)) return;

        this.updateAccumulatedTradeStats(newTrades);

        const tickerStats = { ...this.tickerStats };
        let localTrades = [...this.trades];


        let localTradeCounterBuy = this.tradeCounterBuy;
        let localTradeCounterSell = this.tradeCounterSell;
        let localTradeCounter = this.tradeCounter;

        newTrades.forEach(trade => {

          trade.type = 'trade';

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

          if (localTrades.length > 500) {
            localTrades.shift();

            const tickerFrequency = this.tickerFrequency(localTrades);
            const tickerFrequencyBuy = this.tickerFrequency(localTrades.filter(i=>i.side==='buy'));
            const tickerFrequencySell = this.tickerFrequency(localTrades.filter(i=>i.side==='sell'));
            localTrades.forEach(item => {
              item.tickerFrequency = tickerFrequency[item.ticker];
              item.tickerFrequencyBuy = tickerFrequencyBuy[item.ticker];
              item.tickerFrequencySell = tickerFrequencySell[item.ticker];
            });

            /*const tickerFrequency = this.tickerFrequency(localTrades);
            const tickerFrequencyBuy = this.tickerFrequency(localTrades.filter(i=>i.side==='buy'));
            const tickerFrequencySell = this.tickerFrequency(localTrades.filter(i=>i.side==='sell'));

            localTrades.forEach(item => {


              item.tickerFrequency = tickerFrequency[item.ticker]/500;
              item.tickerFrequencyBuy = tickerFrequencyBuy[item.ticker]/500;
              item.tickerFrequencySell = tickerFrequencySell[item.ticker]/500;


              //Первая ячейка в самом начале сбора статистики, еще не была заполнена ни разу
              if(this.tradeCounter<1000 && this.historyTickers['GAZP'].length === 0){

                if(this.historyTickers['GAZP'].length === 0) this.historyTickers['GAZP'].push({sum: 0, counter: 0});
                if(this.historyTickers['LKOH'].length === 0) this.historyTickers['LKOH'].push({sum: 0, counter: 0});
                if(this.historyTickers['SBER'].length === 0) this.historyTickers['SBER'].push({sum: 0, counter: 0});

                this.historyTickers['GAZP'][0].counter++;
                this.historyTickers['LKOH'][0].counter++;
                this.historyTickers['SBER'][0].counter++;

                this.historyTickers['GAZP'][0].sum = this.historyTickers['GAZP'][0].sum + tickerFrequency['GAZP']/500;
                this.historyTickers['LKOH'][0].sum = this.historyTickers['LKOH'][0].sum + tickerFrequency['LKOH']/500;
                this.historyTickers['SBER'][0].sum = this.historyTickers['SBER'][0].sum + tickerFrequency['SBER']/500;

                this.historyTickers['GAZP'][0].avg = (this.historyTickers['GAZP'][0].sum + item.tickerFrequency)/this.historyTickers['GAZP'][0].counter;
                this.historyTickers['LKOH'][0].avg = (this.historyTickers['LKOH'][0].sum + item.tickerFrequency)/this.historyTickers['LKOH'][0].counter;
                this.historyTickers['SBER'][0].avg = (this.historyTickers['SBER'][0].sum + item.tickerFrequency)/this.historyTickers['SBER'][0].counter;
              }

              //Первая ячейка переполнилась первый раз, создаем из нее вторую
              if(this.tradeCounter>1000 && this.historyTickers['GAZP'].length===1) this.historyTickers['GAZP'].unshift(this.historyTickers['GAZP'][0]);
              if(this.tradeCounter>1000 && this.historyTickers['LKOH'].length===1) this.historyTickers['LKOH'].unshift(this.historyTickers['LKOH'][0]);
              if(this.tradeCounter>1000 && this.historyTickers['SBER'].length===1) this.historyTickers['SBER'].unshift(this.historyTickers['SBER'][0]);

              //Наполнение второй ячейки первый раз
              if(this.tradeCounter>1000 && this.historyTickers['GAZP'].length === 1){

                this.historyTickers['GAZP'][1].counter++;
                this.historyTickers['LKOH'][1].counter++;
                this.historyTickers['SBER'][1].counter++;

                this.historyTickers['GAZP'][1].sum = this.historyTickers['GAZP'][1].sum + tickerFrequency['GAZP']/500;
                this.historyTickers['LKOH'][1].sum = this.historyTickers['LKOH'][1].sum + tickerFrequency['LKOH']/500;
                this.historyTickers['SBER'][1].sum = this.historyTickers['SBER'][1].sum + tickerFrequency['SBER']/500;

                this.historyTickers['GAZP'][1].avg = (this.historyTickers['GAZP'][1].sum + item.tickerFrequency)/this.historyTickers['GAZP'][1].counter;
                this.historyTickers['LKOH'][1].avg = (this.historyTickers['LKOH'][1].sum + item.tickerFrequency)/this.historyTickers['LKOH'][1].counter;
                this.historyTickers['SBER'][1].avg = (this.historyTickers['SBER'][1].sum + item.tickerFrequency)/this.historyTickers['SBER'][1].counter;
              }

              //Вторая ячейка переполнилась
              if(this.tradeCounter>2000 && this.historyTickers['GAZP'].length===2) this.historyTickers['GAZP'].unshift(this.historyTickers['GAZP'][0]);
              if(this.tradeCounter>2000 && this.historyTickers['LKOH'].length===2) this.historyTickers['LKOH'].unshift(this.historyTickers['LKOH'][0]);
              if(this.tradeCounter>2000 && this.historyTickers['SBER'].length===2) this.historyTickers['SBER'].unshift(this.historyTickers['SBER'][0]);

              //console.log('counter', this.tradeCounter);
            });*/

            //console.log(localTrades[0]);
          }

        });

        //console.log('Buy', this.calculateBuyTotalByTicker(localTrades));
        //console.log('Sell', this.calculateSellTotalByTicker(localTrades));

        this.trades = localTrades;

        this.tradeCounterBuy = localTradeCounterBuy;
        this.tradeCounterSell = localTradeCounterSell;
        this.tradeCounter = localTradeCounter;

        this.tickerStats = tickerStats;

        this.$emit('update-trades', newTrades);
        this.$emit('update-trades-summary', this.marketSummary);
        this.$emit('update-trades-counters', this.tradesCounters);

      };
    },

  },

  mounted() {
    this.connectToWebSocket();
  },

};
</script>

