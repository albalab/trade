<template>
  <div style="background: white; overflow: hidden;">
    <h2>Candles</h2>

    candleCounter: {{candleCounter}}<br>

    <div style="overflow: auto; height: 350px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          <div>Статистика по всем свечам</div>
          <div class="stats-diagram">
            <div v-for="(item, ticker) in sortedAccumulatedCandleStats"
                 :key="ticker"
                 class="row">
              <div class="cell">
                <div class="ticker-info">
                    <span class="ticker"
                          @click="selectTicker(ticker)">{{ticker}}</span> {{item}}
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ width: `${100 * (item/Math.max(...Object.values(accumulatedCandleStats)))}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>Последние 200 свечей</div>
          <div class="stats-diagram">
            <div v-for="(candles, ticker) in sortedCandles"
                 :key="ticker"
                 class="row">
              <div class="cell">
                <div class="ticker-info">
                    <span class="ticker"
                          @click="selectTicker(ticker)">{{ticker}}</span> {{candles.length}}
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ width: `${100 * (candles.length / Math.max(...Object.values(sortedCandles).map(c => c.length)))}%` }"></div>
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
import { tickers } from '../tickers.js';
export default {
  name: 'alor-candles',
  data() {
    return {

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

    sortedAccumulatedCandleStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedCandleStats).sort(([, valueA], [, valueB]) => valueB - valueA)
      );
    },

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

    sortedCandles() {
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
        const newCandles = JSON.parse(event.data);

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
        } else {
          console.warn('Received non-array data:', newCandles); // Логирование данных, если это не массив
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
