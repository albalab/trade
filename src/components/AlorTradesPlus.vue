<template>
  <div>

    <StatisticAggregator v-if="currentTrades" :items="currentTrades" />

    <AlorTrades
        @update-trades="updateTrades"
        @update-trades-counters="updateTradesCounters"
        @update-trades-summary="updateTradesSummary"/>

  </div>
</template>

<script>
import AlorTrades from './AlorTrades.vue';
import StatisticAggregator from './StatisticAggregator.vue';
//import {useCacheStore} from "@/stores/cacheStore";
import {onUnmounted} from "vue";
export default {
  name: 'alor-trades-plus',

  setup() {
    //const cacheStore = useCacheStore();

    //const tradeHistory = ref(cacheStore.tradeHistory || []);
    //const tradeHistoryBuy = ref(cacheStore.tradeHistoryBuy || []);
    //const tradeHistorySell = ref(cacheStore.tradeHistorySell || []);

    //const tickerStats = ref(cacheStore.tickerStats || []);

    // Функция для периодического сохранения состояния
    /*const saveState = () => {
      //cacheStore.tradeHistory = tradeHistory.value;
      //cacheStore.tradeHistoryBuy = tradeHistoryBuy.value;
      //cacheStore.tradeHistorySell = tradeHistorySell.value;

      //cacheStore.tickerStats = tickerStats.value;

    };*/

    // Запускаем таймер для сохранения состояния каждые 5 секунд

    /*onMounted(() => {
      setInterval(saveState, 15000); // Сохраняем каждые 15 секунд
    });*/

    // Очищаем таймер при размонтировании компонента
    onUnmounted(() => {
      //clearInterval(saveInterval);
      //clearInterval(this.clearDataInterval);
    });

    return {
      //tradeHistory,
      //tradeHistoryBuy,
      //tradeHistorySell,
      //tickerStats,
    };
  },

  props: {
    profitPercent: Number,
  },

  components: {
    AlorTrades,
    StatisticAggregator,

  },

  data() {
    return {

      currentTrades: null,

      tradeCounter: 0,
      tradeCounterBuy: 0,
      tradeCounterSell: 0,

      tradeHistory: [],
      tradeHistorySell: [],
      tradeHistoryBuy: [],

      tickerStats: [],

      intervals: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216],

      intervalCounters: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervalCountersBuy: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervalCountersSell: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),

      collectedClosePrice: {},
      collectedLastPrices: {},
      collectedLastPricesSell: {},
      maxLength: 500,

      startCountingTime: Date.now(),

      expirationTime: 20000,

    };
  },


  computed: {

    /*marketStats() {
      return {
        tradeCounter: this.tradeCounter,
        tradeCounterBuy: this.tradeCounterBuy,
        tradeCounterSell: this.tradeCounterSell,
      }
    },*/

    tradesStatistics() {
      return {
        tradeHistory: this.tradeHistory,
        tradeHistoryBuy: this.tradeHistoryBuy,
        tradeHistorySell: this.tradeHistorySell,
        tickerStats: this.tickerStats,
        advantageousBuyDifferences: this.advantageousBuyDifferences,
        advantageousSellDifferences: this.advantageousSellDifferences,
      }
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
            maxDifference > this.profitPercent && // Процент должен быть больше 0
            buyPrice !== null &&
            sellPrice !== null &&
            buyPrice !== sellPrice // Исключаем одинаковые цены
        ) {
          differences[ticker] = {
            percentage: maxDifference.toFixed(2),
            buyPrice,
            sellPrice,
            side: 'up',
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
            maxDifference > this.profitPercent && // Процент должен быть больше 0
            sellPrice !== null &&
            buyPrice !== null &&
            sellPrice !== buyPrice // Исключаем одинаковые цены
        ) {
          differences[ticker] = {
            percentage: maxDifference.toFixed(2),
            sellPrice,
            buyPrice,
            side: 'down',
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

  },

  methods: {

    selectTicker(ticker){
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },

    emitTradesStatistics() {
      setTimeout(() => {
        this.$emit('update-trades-statistics', this.tradesStatistics);
        this.emitTradesStatistics();
      }, 200);
    },

    updateTrades(trades){
      this.currentTrades = trades;
      this.collectTradeData(trades);
      this.collectMainStats(trades);
      this.collectDeepStats(trades);
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


    collectMainStats(trades){
      let localTradeCounterBuy = this.tradeCounterBuy;
      let localTradeCounterSell = this.tradeCounterSell;
      let tradeCounter = this.tradeCounter;

      trades.forEach((trade) => {
        tradeCounter++;
        if (trade.side === 'buy') {
          localTradeCounterBuy++;
        } else if (trade.side === 'sell') {
          localTradeCounterSell++;
        }
      });

      this.tradeCounterBuy = localTradeCounterBuy;
      this.tradeCounterSell = localTradeCounterSell;
      this.tradeCounter = tradeCounter;

    },

    collectDeepStats(trades){

      const localTickerStats = JSON.parse(JSON.stringify(this.tickerStats));

      trades.forEach((trade) => {

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

        this.updateTradeHistoryForTicker(trade, localTickerStats);

      });

      this.tickerStats = localTickerStats;

      this.collectSellTradeData(trades);
      this.collectBuyTradeData(trades);

      this.updateTradeHistory();

    },

    updateTradesCounters(tradesCounters){
      this.$emit('update-trades-counters', tradesCounters);
    },

    updateTradesSummary(tradesSummary){
      this.$emit('update-trades-summary', tradesSummary);
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


    updateTradeHistory() {
      const latestTradeTime = Date.now();

      // Создаем локальные копии массивов для истории
      const localTradeHistory = [...this.tradeHistory];
      const localTradeHistoryBuy = [...this.tradeHistoryBuy];
      const localTradeHistorySell = [...this.tradeHistorySell];

      // Выполняем вычисления с локальными копиями
      this.calculateIntervalStats(localTradeHistory, this.intervalCounters, this.tradeCounter, latestTradeTime);
      this.calculateIntervalStats(localTradeHistoryBuy, this.intervalCountersBuy, this.tradeCounterBuy, latestTradeTime);
      this.calculateIntervalStats(localTradeHistorySell, this.intervalCountersSell, this.tradeCounterSell, latestTradeTime);

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
    },

  },

  mounted() {
    this.emitTradesStatistics();
    setInterval(this.clearOldData, this.expirationTime);
  },

};
</script>



