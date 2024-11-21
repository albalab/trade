<template>
  <div>
    <h2>Trades</h2>
    <div>totalCountTrades: {{ totalCountTrades }}</div>
    <div>tradesCountBuy: {{tradesCountBuy}}</div>
    <div>tradesCountSell: {{tradesCountSell}}</div>

    <div style="overflow: auto; height: 350px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          <h3>Накопленная статистика</h3>
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

    <div style="border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Топ 10 выгодных сделок (Покупки)
      <div v-for="(item, ticker) in advantageousBuyDifferences" :key="ticker">
    <span class="select-ticker"
          @click="selectTicker(ticker)">
      {{ ticker }}
    </span>:
        {{ item.percentage }}% (Buy: {{ item.buyPrice }} → Sell: {{ item.sellPrice }})
      </div>
    </div>

    <div style="border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Топ 10 выгодных сделок (Продажи)
      <div v-for="(item, ticker) in advantageousSellDifferences" :key="ticker">
    <span class="select-ticker"
          @click="selectTicker(ticker)">
      {{ ticker }}
    </span>:
        {{ item.percentage }}% (Sell: {{ item.sellPrice }} → Buy: {{ item.buyPrice }})
      </div>
    </div>
<!--
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
-->

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

      tradeCounter: 0,

      accumulatedTradeStats: {},

      collectedClosePrice: {},

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

      // Сортируем тикеры по процентной разнице и оставляем только топ-10
      return Object.entries(differences)
          .sort(([, a], [, b]) => b.percentage - a.percentage) // Сортируем по убыванию процента
          .slice(0, 10) // Берем первые 10
          .reduce((acc, [ticker, data]) => {
            acc[ticker] = data;
            return acc;
          }, {}); // Преобразуем обратно в объект
    },

    advantageousBuyDifferences() {
      const differences = {};
      const timeInterval = 100; // Интервал в миллисекундах (5 секунд)
      const closePrices = this.collectedClosePrice || {};

      for (const [ticker, { buy, sell }] of Object.entries(closePrices)) {
        if (!buy.length || !sell.length) {
          continue; // Пропускаем тикеры без данных
        }

        let maxDifference = 0;
        let buyPrice = null;
        let sellPrice = null;

        buy.forEach((buyEntry) => {
          const { price: buyPriceCandidate, timestamp: buyTime } = buyEntry;

          if (!buyPriceCandidate || buyPriceCandidate <= 0) return; // Пропускаем некорректные цены

          sell.forEach((sellEntry) => {
            const { price: sellPriceCandidate, timestamp: sellTime } = sellEntry;

            if (!sellPriceCandidate || sellPriceCandidate <= 0) return; // Пропускаем некорректные цены

            if (
                sellTime > buyTime && // Проверяем порядок времени
                sellTime - buyTime >= timeInterval // Учитываем временной интервал
            ) {
              const diff = ((sellPriceCandidate - buyPriceCandidate) / buyPriceCandidate) * 100;

              if (diff > maxDifference) {
                maxDifference = diff;
                buyPrice = buyPriceCandidate;
                sellPrice = sellPriceCandidate;
              }
            }
          });
        });

        if (
            maxDifference > 0.2 && // Процент должен быть больше 0
            buyPrice !== null &&
            sellPrice !== null &&
            buyPrice !== sellPrice // Исключаем одинаковые цены
        ) {
          differences[ticker] = {
            percentage: maxDifference.toFixed(2),
            buyPrice,
            sellPrice,
          };
        }
      }

      return Object.entries(differences)
          .sort(([, a], [, b]) => b.percentage - a.percentage)
          .slice(0, 10)
          .reduce((acc, [ticker, data]) => {
            acc[ticker] = data;
            return acc;
          }, {});
    },

    advantageousSellDifferences() {
      const differences = {};
      const timeInterval = 100; // Интервал в миллисекундах (5 секунд)
      const closePrices = this.collectedClosePrice || {};

      for (const [ticker, { sell, buy }] of Object.entries(closePrices)) {
        if (!sell.length || !buy.length) {
          continue; // Пропускаем тикеры без данных
        }

        let maxDifference = 0;
        let sellPrice = null;
        let buyPrice = null;

        sell.forEach((sellEntry) => {
          const { price: sellPriceCandidate, timestamp: sellTime } = sellEntry;

          if (!sellPriceCandidate || sellPriceCandidate <= 0) return; // Пропускаем некорректные цены

          buy.forEach((buyEntry) => {
            const { price: buyPriceCandidate, timestamp: buyTime } = buyEntry;

            if (!buyPriceCandidate || buyPriceCandidate <= 0) return; // Пропускаем некорректные цены

            if (
                buyTime > sellTime && // Покупка позже продажи
                buyTime - sellTime >= timeInterval // Учитываем временной интервал
            ) {
              const diff = ((sellPriceCandidate - buyPriceCandidate) / sellPriceCandidate) * 100;

              if (diff > maxDifference) {
                maxDifference = diff;
                sellPrice = sellPriceCandidate;
                buyPrice = buyPriceCandidate;
              }
            }
          });
        });

        if (
            maxDifference > 0.2 && // Процент должен быть больше 0
            sellPrice !== null &&
            buyPrice !== null &&
            sellPrice !== buyPrice // Исключаем одинаковые цены
        ) {
          differences[ticker] = {
            percentage: maxDifference.toFixed(2),
            sellPrice,
            buyPrice,
          };
        }
      }

      return Object.entries(differences)
          .sort(([, a], [, b]) => b.percentage - a.percentage)
          .slice(0, 10)
          .reduce((acc, [ticker, data]) => {
            acc[ticker] = data;
            return acc;
          }, {});
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

    reversedTrades() {
      return this.trades.slice().reverse();
    }
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

    collectTradeData(trades) {
      const updatedClosePrices = { ...this.collectedClosePrice };

      trades.forEach((trade) => {
        const { ticker, price, side, time } = trade;

        // Если тикер отсутствует, создаем объект
        if (!updatedClosePrices[ticker]) {
          updatedClosePrices[ticker] = { buy: [], sell: [] };
        }

        // Преобразуем `time` в миллисекунды
        const timestamp = Date.parse(time);

        if (isNaN(timestamp)) {
          console.warn(`Invalid time for trade:`, trade);
          return;
        }

        const entry = { price, timestamp };

        if (side === "buy") {
          updatedClosePrices[ticker].buy.push(entry);
          if (updatedClosePrices[ticker].buy.length > this.maxLength) {
            updatedClosePrices[ticker].buy.shift(); // Удаляем старейшие данные
          }
        } else if (side === "sell") {
          updatedClosePrices[ticker].sell.push(entry);
          if (updatedClosePrices[ticker].sell.length > this.maxLength) {
            updatedClosePrices[ticker].sell.shift();
          }
        }
      });

      this.collectedClosePrice = updatedClosePrices;
    },

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

      // Очистка данных collectedClosePrice
      for (const ticker in this.collectedClosePrice) {
        const { buy, sell } = this.collectedClosePrice[ticker];

        // Удаляем устаревшие покупки
        this.collectedClosePrice[ticker].buy = buy.filter(
            entry => now - entry.timestamp <= this.expirationTime
        );

        // Удаляем устаревшие продажи
        this.collectedClosePrice[ticker].sell = sell.filter(
            entry => now - entry.timestamp <= this.expirationTime
        );

        // Если ни покупок, ни продаж не осталось, удаляем тикер
        if (
            !this.collectedClosePrice[ticker].buy.length &&
            !this.collectedClosePrice[ticker].sell.length
        ) {
          delete this.collectedClosePrice[ticker];
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

        this.collectTradeData(trades);
        this.updateAccumulatedTradeStats(trades);

        // Локальные переменные для накопления данных
        let localTrades = [...this.trades];

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

        if (localTrades.length > 200) localTrades.splice(0, localTrades.length - 200);

        this.trades = localTrades;

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
