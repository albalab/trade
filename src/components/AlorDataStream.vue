<template>
  <div>
    <StatisticRenderer
        :items="newTrades"
    />
<!--    {{newTrades}}-->
  </div>
</template>

<script>
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';
import StatisticRenderer from "@/components/StatisticRenderer.vue";
export default {
  name: 'alor-data-stream',
  components: {StatisticRenderer},
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

      newCandles: [],
      newOrderbooks: [],
      newTrades: [],
      newQuotes: [],

      trades: [],
      candles: [],
      quotes: [],
      orderbooks: [],

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

      const socket = new WebSocket('wss://signalfabric.com/datastream/');

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if(!data.data) return;
        if(!data.data.trades) return;

        const newTrades = data.data.trades;

        //const redisMergedData = data.filter(item => item.type === 'redisMergedData');
        //this.redisMergedData = redisMergedData.length ? redisMergedData[0].data : {}

        //console.log(this.redisMergedData.trades);

        //const newCandles = this.redisMergedData.candles; //data.filter(item => item.type === 'candle');
        //const newOrderbooks = this.redisMergedData.orderbooks; //data.filter(item => item.type === 'orderbook');
        //const newTrades = this.redisMergedData.trades; //data.filter(item => item.type === 'trade');
        //const newQuotes = this.redisMergedData.quotes; //data.filter(item => item.type === 'quote');

        //const candlesSummary = data.filter(item => item.type === 'candlesSummary');
        //const groupedCandles = data.filter(item => item.type === 'groupedCandles');
        //const sortedCandlesStats = data.filter(item => item.type === 'sortedCandlesStats');

        //this.candlesSummary = candlesSummary.length ? candlesSummary[0].data : {}
        //this.groupedCandles = groupedCandles.length ? groupedCandles[0].data : {}
        //this.sortedCandlesStats = sortedCandlesStats.length ? sortedCandlesStats[0].data : {}

       /*
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

          this.newCandles = newCandles;
          this.newTrades = newTrades;
          this.newOrderbooks = newOrderbooks;
          this.newQuotes = newQuotes;
*/
          this.newTrades = newTrades;
          //console.log(newTrades);

          /*this.$emit('update-quotes', newQuotes);
          this.$emit('update-orderbooks', newOrderbooks);
        this.$emit('update-candles', newCandles);*/
          this.$emit('update-trades', newTrades);
          //this.$emit('update-candles-counters', this.candlesCounters);
          //this.$emit('update-candles-summary', this.candlesSummary);


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
    //this.connectToWebSocket();
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
