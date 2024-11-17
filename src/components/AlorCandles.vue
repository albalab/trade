<template>
  <div style="background: white; overflow: hidden;">
    <h2>Real-time Candlestick Data</h2>

    <div v-for="item in cacheCandles" :key="item.id">
      {{item}}
    </div>

    <div style="float: left; width: 200px; border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Процентная разница между минимальной и максимальной ценой закрытия за последние 100 свечей
      <div v-for="item in percentageDifferencesSorted.splice(0,10)" :key="item.id">
        {{item.ticker}}: {{item.difference}}%
      </div>
    </div>

    <div style="float: left; width: 200px; height: 500px; overflow: hidden; padding: 10px; border: solid 1px #ccc;">
      Статистика распределения количества свечей по тикерам
      <div style="display: table;">

        <div v-for="(candles, ticker) in groupedCandles"
             :key='candles.id'
             style="display: table-row;">
          <div style="display: table-cell; width: 60px;">{{ticker}}:</div>

          <div style="display: table-cell; width: 80px">{{candles[candles.length-1].close}}</div>

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

    percentageDifferencesSorted() {
      // Преобразуем в массив и сортируем по значению разницы
      return Object.entries(this.percentageDifferences)
          .sort(([, a], [, b]) => b - a) // Сортировка по убыванию значений
          .map(([ticker, difference]) => ({ ticker, difference }));
    },

    percentageDifferences() {
      const differences = {};

      for (const [ticker, prices] of Object.entries(this.collectedClosePrice)) {
        if (prices.length === 0) {
          differences[ticker] = null;
          continue;
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        // Проверка, чтобы избежать деления на ноль
        differences[ticker] = min === max ? 0 : ((max - min) / min * 100).toFixed(2);
      }

      return differences;
    },


    marketSummary() {
      const summary = {};

      // Обработка данных свечей
      this.candles.forEach((candle) => {
        const { ticker, close, volume, time } = candle;
        summary[ticker] = summary[ticker] || {};

        summary[ticker].lastClosePriceLevel = Math.round(close/this.tickersSteps[ticker]);
        summary[ticker].lastClosePrice = close;
        summary[ticker].candleVolume = volume;
        summary[ticker].timestampCandle = time;
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
      if (!this.candles) return;

      const sortByCount = true;

      // Группировка свечей по тикерам
      let grouped = this.candles.reduce((acc, candle) => {
        const ticker = candle.ticker;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(candle);
        return acc;
      }, {});

      // Опциональная сортировка
      if (sortByCount) {
        // Сортировка по количеству элементов в массивах
        grouped = Object.entries(grouped)
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
      } else {
        // Сортировка по алфавиту по тикерам (ключам)
        grouped = Object.keys(grouped)
            .sort()
            .reduce((acc, key) => {
              acc[key] = grouped[key];
              return acc;
            }, {});
      }

      return grouped;
    },


  },

  mounted() {
    this.connectToWebSocket();
    this.postMessage();
    this.updateCandles();
  },

  methods: {

    updateCandles() {
      setTimeout(() => {
        this.$emit('update-candles', this.marketSummary);
        this.updateCandles();
      }, 200);
    },

    postMessage() {
      setInterval(() => {

        window.parent.postMessage({
          robot1message: JSON.parse(JSON.stringify(this.tickerStats))
        }, "*");

      }, 500);
    },

    sortedTickerStats() {

      const result = [];

      // Перебираем ключи объекта
      for (const ticker in this.tickerStats) {
        if (this.tickerStats[ticker]) {
          // Добавляем объект в массив
          result.push({ticker: ticker, count: this.tickerStats[ticker]});
        }
      }

      // Сортируем массив по значению count в порядке убывания
      result.sort(function (a, b) {
        return b.count - a.count;
      });

      return result;
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
              if (newCandles.length > 500) {
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
