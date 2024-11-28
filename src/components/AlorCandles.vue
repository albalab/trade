<template>
  <div>

  </div>
</template>

<script>
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';
export default {
  name: 'alor-candles',
  data() {
    return {

      candlesSummary: {},
      groupedCandles: {},
      sortedCandlesStats: {},

      candleCounter: 0,

      accumulatedCandleStats: {},

      tickerInput: "",

      tickerStats: {},

      tickersSteps,
      tickers,

      cacheCandles: [],

      candles: [], // Массив для хранения данных о свечах

      collectedClosePrice: {}, // Хранилище для коллекции цен закрытия
      maxLength: 100 // Максимальная длина массива для каждого тикера
    };
  },
  computed: {

    candlesCounters() {
      return {
        candlesStats: this.sortedCandlesStats,
        candleCounter: this.candleCounter,
        candlesCounters: this.sortedAccumulatedCandleStats, //this.tickerStats,
      }
    },

    sortedAccumulatedCandleStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedCandleStats).sort(([, valueA], [, valueB]) => valueB - valueA)
      );
    },

    /*candlesSummary() {
      const summary = {};

      // Обработка данных свечей
      this.candles.forEach((candle) => {
        const { ticker } = candle;
        summary[ticker] = summary[ticker] || {};

        //summary[ticker].candleLastClosePriceLevel = Math.round(close/this.tickersSteps[ticker]);

        Object.entries(candle).forEach(([key, value]) => {
          const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          summary[ticker][`candle${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`] = value;
        });

        //console.log(candle);

        summary[ticker].candleBodySize = Math.abs(parseFloat(candle.close) - parseFloat(candle.open));
        summary[ticker].candleDirection = parseFloat(candle.close) > parseFloat(candle.open) ? "up" : "down";
        summary[ticker].candleRange = parseFloat(candle.high) - parseFloat(candle.low);
        summary[ticker].candleShadowSize = summary[ticker].candleRange - summary[ticker].candleBodySize;
        summary[ticker].candleUpperShadow = parseFloat(candle.high) - Math.max(parseFloat(candle.open), parseFloat(candle.close));
        summary[ticker].candleLowerShadow = Math.min(parseFloat(candle.open), parseFloat(candle.close)) - parseFloat(candle.low);
        summary[ticker].candleRealBodyToRangeRatio = summary[ticker].candleBodySize / summary[ticker].candleRange;
        summary[ticker].candleVolumePerRange = candle.volume / summary[ticker].candleRange;
        summary[ticker].candleStrength = summary[ticker].candleBodySize * candle.volume;


        //summary[ticker].candleVolume = volume;
        //summary[ticker].timestampCandle = time;
      });

      return summary;
    },

    groupedCandles() {
      return this.candles.reduce((acc, candle) => {
        const ticker = candle.ticker;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(candle);
        return acc;
      }, {});
    },

    sortedCandlesStats() {
      return Object.entries(this.groupedCandles)
          .sort(([, a], [, b]) => b.length - a.length)
          .reduce((acc, [key, value]) => {
            acc[key] = value.length;
            return acc;
          }, {});
    },*/

  },

  methods: {

    processNewCandles(newCandles) {
      const accumulatedStats = { ...this.accumulatedCandleStats };

      newCandles.forEach((candle) => {
        const ticker = candle.ticker;
        accumulatedStats[ticker] = (accumulatedStats[ticker] || 0) + 1;
        this.candles.push(candle);

        // Ограничиваем размер массива
        if (this.candles.length > 200) this.candles.shift();
      });

      this.accumulatedCandleStats = accumulatedStats;
    },

    collectCandleData(candles) {
      // Создаем локальную копию для обновления
      const updatedClosePrice = {...this.collectedClosePrice};

      candles.forEach(candle => {
        const {ticker, close} = candle;

        // Проверяем, существует ли массив для тикера, если нет - создаем
        if (!updatedClosePrice[ticker]) {
          updatedClosePrice[ticker] = [];
        }

        // Добавляем цену закрытия в массив
        updatedClosePrice[ticker].push(close);

        // Если длина массива превышает maxLength, удаляем старые значения
        if (updatedClosePrice[ticker].length > this.maxLength) {
          updatedClosePrice[ticker] = updatedClosePrice[ticker].slice(-this.maxLength);
        }
      });

      // Обновляем collectedClosePrice в конце
      this.collectedClosePrice = updatedClosePrice;
    },

    connectToWebSocket() {

      const socket = new WebSocket('wss://refine.video/candles/');

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (!Array.isArray(data)) return;

        const newCandles = data.filter(item => item.type === 'candle');
        const candlesSummary = data.filter(item => item.type === 'candlesSummary');
        const groupedCandles = data.filter(item => item.type === 'groupedCandles');
        const sortedCandlesStats = data.filter(item => item.type === 'sortedCandlesStats');

        this.candlesSummary = candlesSummary.length ? candlesSummary[0].data : {}
        this.groupedCandles = groupedCandles.length ? groupedCandles[0].data : {}
        this.sortedCandlesStats = sortedCandlesStats.length ? sortedCandlesStats[0].data : {}

        if (Array.isArray(newCandles)) {

          const candles = [...this.candles];
          const tickerStats = {...this.tickerStats};
          let candleCounter = this.candleCounter;

          this.processNewCandles(newCandles);

          newCandles.forEach(candle => {

            if (candle.ticker && candle.time && candle.open !== undefined &&
                candle.close !== undefined && candle.high !== undefined &&
                candle.low !== undefined && candle.volume !== undefined) {

              if (tickerStats[candle.ticker]) {
                tickerStats[candle.ticker]++;
              } else {
                tickerStats[candle.ticker] = 1;
              }

              candles.push(candle);

              candleCounter++;

              if (candles.length > 200) {
                candles.shift();
              }
            } else {
              console.warn('Received invalid candle data:', candle); // Логирование некорректных данных
            }
          });

          this.cacheCandles = this.collectCandleData(newCandles); //[...this.cacheCandles, ...newCandles];
          //console.log(newCandles.length);

          // Обновляем реактивные свойства один раз после цикла
          this.candles = candles;
          this.tickerStats = tickerStats;
          this.candleCounter = candleCounter;

          //console.log(newCandles[0])
          this.$emit('update-candles', newCandles);
          this.$emit('update-candles-counters', this.candlesCounters);
          this.$emit('update-candles-summary', this.candlesSummary);

        } else {
          console.warn('Received non-array data:', data); // Логирование данных, если это не массив
        }
      };

      socket.onopen = () => {
        console.log('Connected to WebSocket');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
  },

  mounted() {
    this.connectToWebSocket();
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
</style>
