<template>
  <div>
    <h2>Real-time Trade Data</h2>
    <div>totalCountTrades: {{ totalCountTrades }}</div>
    <div>tradesCountBuy: {{tradesCountBuy}}</div>
    <div>tradesCountSell: {{tradesCountSell}}</div>

    <div style="border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Топ 10 тикеров с наибольшим изменением последней цены
      <div v-for="item in percentageDifferencesSorted.slice(0,10)" :key="item.ticker">
        <span class="select-ticker"
              @click="selectTicker(item.ticker)">
          {{ item.ticker }}
        </span>:
        {{ item.difference.percentage }}% {{ item.difference.min }} {{ item.difference.max }}
      </div>
    </div>

    <div style="border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Топ 10 тикеров с наибольшим изменением последней цены (Продажи)
      <div v-for="item in percentageDifferencesSellSorted.slice(0,10)" :key="item.ticker">
        <span class="select-ticker"
              @click="selectTicker(item.ticker)">{{ item.ticker }}
        </span>:
        {{ item.difference.percentage }}% {{ item.difference.min }} {{ item.difference.max }}
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

    onMounted(() => {
      setInterval(saveState, 15000); // Сохраняем каждые 15 секунд
    });

    // Очищаем таймер при размонтировании компонента
    onUnmounted(() => {
      //clearInterval(saveInterval);
      //clearInterval(this.clearDataInterval);
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

      expirationTime: 5000,

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
      collectedLastPricesSell: {},
      maxLength: 100, // Максимальная длина массива для каждого тикера
    };
  },


  computed: {

    percentageDifferencesSorted() {
      return Object.entries(this.buyPercentageDifferences)
          .sort(([, a], [, b]) => b.percentage - a.percentage) // Сортируем по `percentage`
          .map(([ticker, difference]) => ({ ticker, difference })); // Возвращаем объект с тикером и данными
    },

    percentageDifferencesSellSorted() {
      return Object.entries(this.sellPercentageDifferences)
          .sort(([, a], [, b]) => b.percentage - a.percentage) // Сортируем по `percentage`
          .map(([ticker, difference]) => ({ ticker, difference })); // Возвращаем объект с тикером и данными
    },

    sellPercentageDifferences() {
      const differences = {};

      for (const [ticker, { prices }] of Object.entries(this.collectedLastPricesSell)) {
        if (!prices || prices.length < 2) {
          differences[ticker] = { percentage: 0, min: null, max: null };
          continue;
        }

        let max = -Infinity;
        let min = Infinity;
        let maxIndex = -1;
        let minIndex = -1;

        // Находим максимум и его индекс
        prices.forEach((price, index) => {
          if (price > max) {
            max = price;
            maxIndex = index;
          }
        });

        // Находим минимум, начиная с позиции maxIndex
        prices.forEach((price, index) => {
          if (index > maxIndex && price < min) {
            min = price;
            minIndex = index;
          }
        });

        if (minIndex > maxIndex && max > min) {
          const percentage = ((max - min) / max * 100).toFixed(2);
          differences[ticker] = { percentage, min, max };
        } else {
          differences[ticker] = { percentage: 0, min, max };
        }
      }

      return differences;
    },

    buyPercentageDifferences() {
      const differences = {};

      for (const [ticker, { prices }] of Object.entries(this.collectedLastPrices)) {
        if (!prices || prices.length < 2) {
          differences[ticker] = { percentage: 0, min: null, max: null };
          continue;
        }

        let max = -Infinity;
        let min = Infinity;
        let maxIndex = -1;
        let minIndex = -1;

        // Находим минимум и его индекс
        prices.forEach((price, index) => {
          if (price < min) {
            min = price;
            minIndex = index;
          }
        });

        // Находим максимум, начиная с позиции minIndex
        prices.forEach((price, index) => {
          if (index > minIndex && price > max) {
            max = price;
            maxIndex = index;
          }
        });

        if (maxIndex > minIndex && max > min) {
          const percentage = ((max - min) / min * 100).toFixed(2);
          differences[ticker] = { percentage, min, max };
        } else {
          differences[ticker] = { percentage: 0, min, max };
        }
      }

      return differences;
    },

    marketSummary() {
      const summary = {};

      // Обработка данных сделок
      this.trades.forEach((trade) => {
        const { ticker, price, qty, side } = trade;

        summary[ticker] = summary[ticker] || {};

        summary[ticker].tradeVolumeAbsoluteRub = parseFloat(trade.price) * trade.qty;

        //summary[ticker].tradeLastPriceLevel = Math.round(price / this.tickersSteps[ticker]);
        summary[ticker].tradeLastPrice = price;
        summary[ticker].tradeLastVolume = qty;
        summary[ticker].tradeLastSide = side;

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

    reversedTrades() {
      return this.trades.slice().reverse();
    }
  },

  methods: {

    /*extendObject(obj, prefix) {
      function toCamelCase(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      }
      Object.keys(obj).forEach(key => {
        const camelCaseKey = toCamelCase(key);
        const newKey = `${prefix}${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`;
        obj[newKey] = obj[key];
      });
      return obj;
    },*/

    selectTicker(ticker){
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");

      //console.log('Select ticker', ticker);
    },

    collectSellTradeData(trades) {
      const now = Date.now(); // Текущее время в миллисекундах
      const updatedLastPricesSell = { ...this.collectedLastPricesSell };

      trades.forEach((trade) => {
        if (trade.side !== "sell") return; // Пропускаем сделки не на продажу

        const { ticker, price } = trade;

        // Если тикера еще нет, создаем запись с массивом цен и таймстемпом
        if (!updatedLastPricesSell[ticker]) {
          updatedLastPricesSell[ticker] = { prices: [], lastUpdate: now, min: price, max: price };
        }

        // Обновляем массив цен, время последнего обновления, минимальную и максимальную цену
        updatedLastPricesSell[ticker].prices.push(price);
        updatedLastPricesSell[ticker].lastUpdate = now;
        updatedLastPricesSell[ticker].min = Math.min(updatedLastPricesSell[ticker].min, price);
        updatedLastPricesSell[ticker].max = Math.max(updatedLastPricesSell[ticker].max, price);

        // Ограничиваем длину массива до maxLength
        if (updatedLastPricesSell[ticker].prices.length > this.maxLength) {
          updatedLastPricesSell[ticker].prices.shift(); // Удаляем старейший элемент
        }
      });

      this.collectedLastPricesSell = updatedLastPricesSell;
    },

    collectBuyTradeData(trades) {
      const now = Date.now(); // Текущее время в миллисекундах
      const updatedLastPrices = { ...this.collectedLastPrices };

      trades.forEach((trade) => {
        if (trade.side !== "buy") return; // Пропускаем сделки не на покупку

        const { ticker, price } = trade;

        // Если тикера еще нет, создаем запись с массивом цен и таймстемпом
        if (!updatedLastPrices[ticker]) {
          updatedLastPrices[ticker] = { prices: [], lastUpdate: now, min: price, max: price };
        }

        // Обновляем массив цен, время последнего обновления, минимальную и максимальную цену
        updatedLastPrices[ticker].prices.push(price);
        updatedLastPrices[ticker].lastUpdate = now;
        updatedLastPrices[ticker].min = Math.min(updatedLastPrices[ticker].min, price);
        updatedLastPrices[ticker].max = Math.max(updatedLastPrices[ticker].max, price);

        // Ограничиваем длину массива до maxLength
        if (updatedLastPrices[ticker].prices.length > this.maxLength) {
          updatedLastPrices[ticker].prices.shift(); // Удаляем старейший элемент
        }
      });

      this.collectedLastPrices = updatedLastPrices;
    },

    clearOldData() {
      const now = Date.now();

      // Очистка данных покупок
      for (const ticker in this.collectedLastPrices) {
        if (now - this.collectedLastPrices[ticker].lastUpdate > this.expirationTime) {
          delete this.collectedLastPrices[ticker];
        }
      }

      // Очистка данных продаж
      for (const ticker in this.collectedLastPricesSell) {
        if (now - this.collectedLastPricesSell[ticker].lastUpdate > this.expirationTime) {
          delete this.collectedLastPricesSell[ticker];
        }
      }
    },

    updateTrades() {
      setTimeout(() => {
        //const mergedTrades = {...this.marketSummary, ...this.trades[this.trades.length-1]};

        this.$emit('update-trades-summary', this.marketSummary);
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

          //const tradeExtended = this.extendObject(trade, "trade");

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
        this.collectSellTradeData(trades);
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

    this.clearDataInterval = setInterval(this.clearOldData, this.expirationTime);
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
.select-ticker{
  cursor: pointer;
}
</style>
