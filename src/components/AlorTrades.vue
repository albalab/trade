<template>
  <div>
    <h2>Real-time Trade Data</h2>
    <div>totalCountTrades: {{ totalCountTrades }}</div>
    <div>tradesCountBuy: {{tradesCountBuy}}</div>
    <div>tradesCountSell: {{tradesCountSell}}</div>

    <div style="width: 200px; border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Топ 10 тикеров с наибольшим изменением последней цены
      <div v-for="item in percentageDifferencesSorted.slice(0,10)" :key="item.ticker">
        {{ item.ticker }}: {{ item.difference }}%
      </div>
    </div>


    <!-- All Trades Statistics with Buy/Sell Comparison -->
    <h3>Trade History Statistics (All):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistory"
          :key="'all-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div class="trade-cell">{{ trade }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistory)) * 100}%` }">
          <div class="block">
            <div
                class="buy-bar"
                :style="{ width: `${(tradeHistoryBuy[index] / trade) * 100}%` }"
            ></div>
            <div
                class="sell-bar"
                :style="{ width: `${(tradeHistorySell[index] / trade) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <h3>Trade History Statistics: <input v-model="selectedTicker"></h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tickerStats[selectedTicker]?.tradeHistory"
          :key="'all-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div class="trade-cell">{{ trade }}</div>
        <div :style="{ width: `${(trade / Math.max(...tickerStats[selectedTicker]?.tradeHistory)) * 100}%` }">
          <div class="block">
            <div
                class="buy-bar"
                :style="{ width: `${(tickerStats[selectedTicker]?.tradeHistoryBuy[index] / trade) * 100}%` }"
            ></div>
            <div
                class="sell-bar"
                :style="{ width: `${(tickerStats[selectedTicker]?.tradeHistorySell[index] / trade) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Trades Statistics -->
    <h3>Trade History Statistics (Buy):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistoryBuy"
          :key="'buy-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div class="trade-cell">{{ trade }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistoryBuy)) * 100}%` }">
          <div class="block" style="background-color: green;"></div>
        </div>
      </div>
    </div>

    <input v-model="priceOrder" placeholder="price"><br>
    <input v-model="tickerOrder" placeholder="ticker"><br>
    <input v-model="sideOrder" placeholder="side"><br>
    <button @click="sendLimitOrder(1, priceOrder, tickerOrder, 'MOEX', sideOrder, 'D88141')">
      Отправить лимитный ордер
    </button>

    <!-- Sell Trades Statistics -->
    <h3>Trade History Statistics (Sell):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistorySell"
          :key="'sell-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div class="trade-cell">{{ trade }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistorySell)) * 100}%` }">
          <div class="block" style="background-color: red;"></div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

import { sendLimitOrder as importedSendLimitOrder } from '../modules/LimitOrderModule.js';
import { tickersSteps } from '../tickersSteps.js';

import { ref, onMounted, onUnmounted } from 'vue';
import { useCacheStore } from '@/stores/cacheStore';
//import { throttle } from '@/stores/helper.js';

export default {
  name: 'TradeData',

  setup() {
    const cacheStore = useCacheStore();

    // Локальные переменные, которые будем сохранять
    const totalCountTrades = ref(cacheStore.totalCountTrades || 0);
    const tradesCountBuy = ref(cacheStore.tradesCountBuy || 0);
    const tradesCountSell = ref(cacheStore.tradesCountSell || 0);

    const tradeHistory = ref(cacheStore.tradeHistory || []);
    const tradeHistoryBuy = ref(cacheStore.tradeHistoryBuy || []);
    const tradeHistorySell = ref(cacheStore.tradeHistorySell || []);

    const tickerStats = ref(cacheStore.tickerStats || []);

    // Функция для периодического сохранения состояния
    const saveState = () => {
      cacheStore.totalCountTrades = totalCountTrades.value;
      cacheStore.tradesCountBuy = tradesCountBuy.value;
      cacheStore.tradesCountSell = tradesCountSell.value;

      cacheStore.tradeHistory = tradeHistory.value;
      cacheStore.tradeHistoryBuy = tradeHistoryBuy.value;
      cacheStore.tradeHistorySell = tradeHistorySell.value;

      cacheStore.tickerStats = tickerStats.value;

    };

    // Запускаем таймер для сохранения состояния каждые 5 секунд
    let saveInterval = null;
    onMounted(() => {
      saveInterval = setInterval(saveState, 15000); // Сохраняем каждые 15 секунд
    });

    // Очищаем таймер при размонтировании компонента
    onUnmounted(() => {
      clearInterval(saveInterval);
    });

    return {
      totalCountTrades,
      tradesCountBuy,
      tradesCountSell,
      tradeHistory,
      tradeHistoryBuy,
      tradeHistorySell,
      tickerStats,
    };
  },

  data() {
    return {
      tickersSteps,

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',

      selectedTicker: 'FLOT',


      trades: [],
      //totalCountTrades: 0,
      //tradeHistory: [],
      //tradeHistoryBuy: [],
      //tradeHistorySell: [],
      intervalCounters: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervalCountersBuy: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervalCountersSell: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervals: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216],
      startCountingTime: Date.now(),

      staticHistory: false,
      //tickerStats: {}  // Новый объект для хранения статистики по каждому тикеру

      collectedLastPrices: {}, // Хранилище для коллекции последних цен
      maxLength: 100, // Максимальная длина массива для каждого тикера
    };
  },


  computed: {

    percentageDifferencesSorted() {
      return Object.entries(this.percentageDifferences)
          .sort(([, a], [, b]) => b - a)
          .map(([ticker, difference]) => ({ ticker, difference }));
    },

    percentageDifferences() {
      const differences = {};

      for (const [ticker, prices] of Object.entries(this.collectedLastPrices)) {
        if (prices.length === 0) {
          differences[ticker] = null;
          continue;
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        differences[ticker] = min === max ? 0 : ((max - min) / min * 100).toFixed(2);
      }

      return differences;
    },

    marketSummary() {
      const summary = {};

      // Обработка данных сделок
      this.trades.forEach((trade) => {
        const { ticker, price, qty, side } = trade;
        summary[ticker] = summary[ticker] || {};

        summary[ticker].lastTradePriceLevel = Math.round(price / this.tickersSteps[ticker]);
        summary[ticker].lastTradePrice = price;
        summary[ticker].lastTradeVolume = qty;
        summary[ticker].lastTradeSide = side;

        summary[ticker].buyVolume = (summary[ticker].buyVolume || 0) + (side === "buy" ? qty : 0);
        summary[ticker].sellVolume = (summary[ticker].sellVolume || 0) + (side === "sell" ? qty : 0);
      });

      return summary;
    },

    reversedTrades() {
      return this.trades.slice().reverse();
    }
  },

  methods: {
    sendLimitOrder: importedSendLimitOrder,

    collectBuyTradeData(trades) {
      const updatedLastPrices = { ...this.collectedLastPrices };

      trades.forEach((trade) => {
        if (trade.side !== "buy") return; // Пропускаем сделки не на покупку

        const { ticker, price } = trade;

        if (!updatedLastPrices[ticker]) {
          updatedLastPrices[ticker] = [];
        }

        updatedLastPrices[ticker].push(price);

        if (updatedLastPrices[ticker].length > this.maxLength) {
          updatedLastPrices[ticker] = updatedLastPrices[ticker].slice(-this.maxLength);
        }
      });

      this.collectedLastPrices = updatedLastPrices;
    },

    updateTrades() {
      setTimeout(() => {
        this.$emit('update-trades', this.marketSummary);
        this.updateTrades();
      }, 200);
    },

    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/trades/');
      socket.onmessage = (event) => {
        const trades = JSON.parse(event.data);
        if (!Array.isArray(trades)) return;

        // Локальные переменные для накопления данных
        const localTrades = [];
        let localTotalCountTrades = this.totalCountTrades;
        let localTradesCountBuy = this.tradesCountBuy;
        let localTradesCountSell = this.tradesCountSell;
        const localTickerStats = JSON.parse(JSON.stringify(this.tickerStats)); // Глубокая копия для избежания реактивности

        trades.forEach(trade => {
          localTrades.push(trade);
          localTotalCountTrades++;

          if (trade.side === 'buy') {
            localTradesCountBuy++;
          } else if (trade.side === 'sell') {
            localTradesCountSell++;
          }

          // Создание структуры для нового тикера, если её нет в локальных данных
          if (!localTickerStats[trade.ticker] && trade.ticker) {
            localTickerStats[trade.ticker] = {
              tradeHistory: Array(this.intervals.length).fill(0),
              tradeHistoryBuy: Array(this.intervals.length).fill(0),
              tradeHistorySell: Array(this.intervals.length).fill(0),
              intervalCounters: Array.from({ length: this.intervals.length }, () => ({
                count: 0, lastUpdate: null, accumulatedTrades: 0
              })),
              intervalCountersBuy: Array.from({ length: this.intervals.length }, () => ({
                count: 0, lastUpdate: null, accumulatedTrades: 0
              })),
              intervalCountersSell: Array.from({ length: this.intervals.length }, () => ({
                count: 0, lastUpdate: null, accumulatedTrades: 0
              }))
            };
          }

          // Обновление статистики для тикера в локальных данных
          this.updateTradeHistoryForTicker(trade, localTickerStats);
        });

        // Ограничение размера массива trades
        if (localTrades.length > 1000) localTrades.splice(0, localTrades.length - 1000);

        // Присваивание локальных значений после завершения цикла
        this.trades.push(...localTrades);
        this.totalCountTrades = localTotalCountTrades;
        this.tradesCountBuy = localTradesCountBuy;
        this.tradesCountSell = localTradesCountSell;
        this.tickerStats = localTickerStats; // Замена тикерной статистики целиком

        // Обновление только для сделок на покупку
        this.collectBuyTradeData(trades);

        // Обновление общей статистики в конце
        this.updateTradeHistory();
      };
    },

    toggleStaticHistory() {
      this.staticHistory = !this.staticHistory;
    },

    updateTradeHistory() {
      const latestTradeTime = Date.now();

      // Создаем локальные копии массивов для истории
      const localTradeHistory = [...this.tradeHistory];
      const localTradeHistoryBuy = [...this.tradeHistoryBuy];
      const localTradeHistorySell = [...this.tradeHistorySell];

      // Выполняем вычисления с локальными копиями
      this.calculateIntervalStats(localTradeHistory, this.intervalCounters, this.totalCountTrades, latestTradeTime);
      this.calculateIntervalStats(localTradeHistoryBuy, this.intervalCountersBuy, this.tradesCountBuy, latestTradeTime);
      this.calculateIntervalStats(localTradeHistorySell, this.intervalCountersSell, this.tradesCountSell, latestTradeTime);

      // Присваиваем обновленные данные обратно в реактивные свойства
      this.tradeHistory = localTradeHistory;
      this.tradeHistoryBuy = localTradeHistoryBuy;
      this.tradeHistorySell = localTradeHistorySell;
    },

    updateTradeHistoryForTicker(trade, localTickerStats) {
      if (!trade.ticker) return;

      const latestTradeTime = Date.now();

      // Делаем временную копию данных по конкретному тикеру
      const tickerData = localTickerStats[trade.ticker] || {
        tradeHistory: Array(this.intervals.length).fill(0),
        tradeHistoryBuy: Array(this.intervals.length).fill(0),
        tradeHistorySell: Array(this.intervals.length).fill(0),
        intervalCounters: Array.from({ length: this.intervals.length }, () => ({
          count: 0, lastUpdate: null, accumulatedTrades: 0
        })),
        intervalCountersBuy: Array.from({ length: this.intervals.length }, () => ({
          count: 0, lastUpdate: null, accumulatedTrades: 0
        })),
        intervalCountersSell: Array.from({ length: this.intervals.length }, () => ({
          count: 0, lastUpdate: null, accumulatedTrades: 0
        }))
      };

      // Обновляем временную копию данных по тикеру
      this.calculateIntervalStats(tickerData.tradeHistory, tickerData.intervalCounters, 1, latestTradeTime);

      if (trade.side === 'buy') {
        this.calculateIntervalStats(tickerData.tradeHistoryBuy, tickerData.intervalCountersBuy, 1, latestTradeTime);
      } else if (trade.side === 'sell') {
        this.calculateIntervalStats(tickerData.tradeHistorySell, tickerData.intervalCountersSell, 1, latestTradeTime);
      }

      // Присваиваем обновленные данные тикера обратно во временную копию `localTickerStats`
      localTickerStats[trade.ticker] = tickerData;
    },

    calculateIntervalStats(history, counters, newCount, latestTime) {
      if (!Array.isArray(history)) return;
      this.intervals.forEach((interval, index) => {
        const intervalMillis = interval * 1000;
        const counter = counters[index];

        if (counter.lastUpdate === null) {
          counter.lastUpdate = this.startCountingTime;
        }

        const elapsedTime = latestTime - counter.lastUpdate;

        if (elapsedTime >= intervalMillis) {
          const intervalTrades = newCount + counter.accumulatedTrades;
          const averageTrades = intervalTrades / interval;

          if (history.length <= index) {
            history.push(averageTrades);
          } else {
            history[index] = averageTrades;
          }

          counter.accumulatedTrades = 0;
          counter.lastUpdate = latestTime;
        } else {
          counter.accumulatedTrades += newCount;
        }
      });
    }
  },

  mounted() {
    this.connectToWebSocket();
    this.updateTrades();
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

.container {
  position: relative;
}

.row {
  margin: 0 0 2px;
  display: grid;
}

.block {
  height: 10px;
  background: #ccc;
}

.buy-bar {
  height: 50%;
  background-color: green;
}

.sell-bar {
  height: 50%;
  background-color: red;
}

.trade-cell{
  width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
}
</style>
