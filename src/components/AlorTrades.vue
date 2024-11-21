<template>
  <div>
    <h2>Trades</h2>
    <div>tradeCounter: {{ tradeCounter }}</div>
    <div>tradeCounterBuy: {{tradeCounterBuy}}</div>
    <div>tradeCounterSell: {{tradeCounterSell}}</div>

    <div style="overflow: hidden; height: 350px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          <h3>Total counts</h3>
          <div class="stats-diagram">
            <div v-for="(count, ticker) in sortedAccumulatedTradeStats" :key="ticker" class="row">
              <div class="cell">
                <div class="ticker-info">
                  <span class="ticker" @click="selectTicker(ticker)">{{ ticker }}</span>: {{ count }}
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ width: `${(count / Math.max(...Object.values(accumulatedTradeStats))) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3>Stream objects</h3>
          <div class="stats-diagram">
            <div v-for="(trades, ticker) in sortedTrades" :key="ticker" class="row">
              <div class="cell">
                <div class="ticker-info">
                  <span class="ticker" @click="selectTicker(ticker)">{{ ticker }}</span> {{ trades.length }}
                </div>
                <div class="progress-bar-container">
                  <div
                      class="progress-bar"
                      :style="{ width: `${100 * (trades.length / Math.max(...Object.values(sortedTrades).map((t) => t.length)))}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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

      expirationTime: 5000,

      tickersSteps,

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',


      trades: [],
      
    };
  },


  computed: {

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

    sortedAccumulatedTradeStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedTradeStats).sort(([, a], [, b]) => b - a)
      );
    },

    marketStats() {
      return {
        tradeCounter: this.tradeCounter,
        tradeCounterBuy: this.tradeCounterBuy,
        tradeCounterSell: this.tradeCounterSell,
      }
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

    updateTrades() {
      setTimeout(() => {
        //const mergedTrades = {...this.marketSummary, ...this.trades[this.trades.length-1]};

        this.$emit('update-trades-summary', this.marketSummary);
        this.$emit('update-trades-stats', this.marketStats);
        this.updateTrades();
      }, 200);
    },

    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/trades/');
      socket.onmessage = (event) => {
        const trades = JSON.parse(event.data);
        if (!Array.isArray(trades)) return;

        this.updateAccumulatedTradeStats(trades);
        
        this.$emit('update-trades', trades);


        let localTrades = [...this.trades];

        let localTradeCounterBuy = this.tradeCounterBuy;
        let localTradeCounterSell = this.tradeCounterSell;
        let tradeCounter = this.tradeCounter;

        trades.forEach(trade => {

          //this.$emit('update-trade', trade);

          localTrades.push(trade);
          tradeCounter++;

          if (trade.side === 'buy') {
            localTradeCounterBuy++;
          } else if (trade.side === 'sell') {
            localTradeCounterSell++;
          }
        });


        if (localTrades.length > 200) localTrades.splice(0, localTrades.length - 200);

        this.trades = localTrades;
        
        this.tradeCounterBuy = localTradeCounterBuy;
        this.tradeCounterSell = localTradeCounterSell;
        this.tradeCounter = tradeCounter;


      };
    },

  },

  mounted() {
    this.connectToWebSocket();
    this.updateTrades();
  },

};
</script>

