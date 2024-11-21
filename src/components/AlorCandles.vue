<template>
  <div style="background: white; overflow: hidden;">
    <h2>Candles</h2>

    <div v-for="item in cacheCandles" :key="item.id">
      {{item}}
    </div>

    <div style="float: left; height: 500px; overflow: hidden; padding: 10px; border: solid 1px #ccc;">
      Статистика распределения количества свечей по тикерам
      <div style="display: table;">

        <div v-for="(candles, ticker) in sortedCandlesLastStats"
             :key='candles.id'
             style="display: table-row;">
          <div style="display: table-cell; width: 60px;">{{ticker}}:</div>

          <div style="display: table-cell; width: 80px"><!--{{candles[candles.length-1].close}}--> {{candles.length}}</div>

          <div style="display: table-cell; width: 100px;">
            <div style="position: relative;">
              <div style="position: absolute; height: 2px; background: black;"
                   :style="{ width: `${10*candles.length}%` }"></div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';
export default {
  name: 'alor-candles',
  data() {
    return {

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

    marketSummary() {
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

    tickerArray() {
      return this.tickerInput.split(',').map(ticker => ticker.trim()); // Преобразуем строку в массив
    },

    // Обратный порядок для отображения актуальных данных в начале
    reversedCandles() {
      return this.candles.slice().reverse(); // Возвращаем перевернутую копию массива
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

    sortedCandlesLastStats() {
      const grouped = this.groupedCandles; // Вызываем основное вычисляемое свойство
      return Object.entries(grouped)
          .sort(([, a], [, b]) => b.length - a.length) // Сортируем
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
    },


  },

  mounted() {
    this.connectToWebSocket();
    this.updateCandles();
  },

  methods: {

    updateCandles() {
      setTimeout(() => {
        //const mergedCandles = {...this.marketSummary, ...this.candles[this.candles.length-1]};
        //console.log(this.marketSummary);
        this.$emit('update-candles-summary', this.marketSummary);
        this.updateCandles();
      }, 500);
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
      // Устанавливаем соединение с WebSocket сервером на порту 3333
      const socket = new WebSocket('wss://refine.video/candles/');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {
        const candles = JSON.parse(event.data);

        // Проверяем, что пришедшие данные — массив
        if (Array.isArray(candles)) {
          // Локальные переменные для накопления данных
          const newCandles = [...this.candles];
          const newTickerStats = {...this.tickerStats};

          candles.forEach(candle => {
            // Проверка на наличие всех необходимых полей
            if (candle.ticker && candle.time && candle.open !== undefined &&
                candle.close !== undefined && candle.high !== undefined &&
                candle.low !== undefined && candle.volume !== undefined) {

              if (newTickerStats[candle.ticker]) {
                newTickerStats[candle.ticker]++;
              } else {
                newTickerStats[candle.ticker] = 1;
              }

              newCandles.push(candle);

              // Сохраняем только последние 100 свечей для оптимизации
              if (newCandles.length > 200) {
                newCandles.shift();
              }
            } else {
              console.warn('Received invalid candle data:', candle); // Логирование некорректных данных
            }
          });

          this.cacheCandles = this.collectCandleData(newCandles); //[...this.cacheCandles, ...newCandles];
          //console.log(newCandles.length);

          // Обновляем реактивные свойства один раз после цикла
          this.candles = newCandles;
          this.tickerStats = newTickerStats;
        } else {
          console.warn('Received non-array data:', candles); // Логирование данных, если это не массив
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
