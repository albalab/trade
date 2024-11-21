<template>
  <div>

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
        {{ item.percentage }}% (Buy: {{ item.buyPrice }} → Sell: {{ item.sellPrice }})
      </div>
    </div>


    <AlorTrades
        @update-trades="updateTrades"
        @update-trade="updateTrade"
        @update-trades-summary="updateTradesSummary"/>
  </div>
</template>

<script>
import AlorTrades from './AlorTrades.vue';
export default {
  name: 'alor-trades-plus',
  components: {
    AlorTrades,
  },

  data() {
    return {
      collectedClosePrice: {},
    };
  },


  computed: {

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

  },

  methods: {

    selectTicker(ticker){
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },

    updateTrades(trades){
      this.collectTradeData(trades);
    },

    updateTrade(){
      //console.log(trade);
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

  },

  mounted() {

  },

};
</script>
