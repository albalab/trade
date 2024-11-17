<template>
  <div style="background: white; overflow: hidden;">
    <h2>Real-time Quotes Data</h2>

    <div v-for="item in cacheQuotes" :key="item.id">
      {{ item }}
    </div>

    <div style="float: left; width: 200px; border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
      Топ 10 тикеров с наибольшим изменением последней цены
      <div v-for="item in percentageDifferencesSorted.slice(0,10)" :key="item.ticker">
        {{ item.ticker }}: {{ item.difference }}%
      </div>
    </div>

    <div style="float: left; width: 200px; height: 500px; overflow: hidden; padding: 10px; border: solid 1px #ccc;">
      Статистика распределения количества котировок по тикерам
      <div style="float: left; width: 200px; height: 500px; overflow: hidden; padding: 10px; border: solid 1px #ccc;">
        Статистика распределения количества котировок по тикерам
        <div v-for="(quotes, ticker) in groupedQuotes"
             :key='quotes.id'
             style="display: table-row;">
          <div style="display: table-cell; width: 60px;">{{ticker}}:</div>

          <div style="display: table-cell; width: 80px">{{quotes[quotes.length-1].last_price}}</div>

          <div style="display: table-cell; width: 100px;">
            <div style="position: relative;">
              <div style="position: absolute; height: 2px; background: black;"
                   :style="{ width: `${10*quotes.length}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "alor-quotes",
  data() {
    return {
      tickerStats: {},

      cacheQuotes: [],

      quotes: [], // Массив для хранения данных о котировках

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

    groupedQuotes() {
      if (!this.quotes) return {};

      const sortByCount = true; // Если true — сортируем по количеству котировок, иначе по алфавиту

      // Группировка котировок по тикерам
      let grouped = this.quotes.reduce((acc, quote) => {
        const ticker = quote.ticker;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(quote);
        return acc;
      }, {});

      // Опциональная сортировка
      if (sortByCount) {
        // Сортировка по количеству элементов в массивах
        grouped = Object.entries(grouped)
            .sort(([, a], [, b]) => b.length - a.length) // Сортируем по длине массивов
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
      } else {
        // Сортировка по алфавиту по тикерам (ключам)
        grouped = Object.keys(grouped)
            .sort() // Сортируем ключи по алфавиту
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
  },
  methods: {
    collectQuoteData(quotes) {
      const updatedLastPrices = { ...this.collectedLastPrices };

      quotes.forEach((quote) => {
        const { ticker, last_price } = quote;

        if (!updatedLastPrices[ticker]) {
          updatedLastPrices[ticker] = [];
        }

        updatedLastPrices[ticker].push(last_price);

        if (updatedLastPrices[ticker].length > this.maxLength) {
          updatedLastPrices[ticker] = updatedLastPrices[ticker].slice(-this.maxLength);
        }
      });

      this.collectedLastPrices = updatedLastPrices;
    },

    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/quotes/');

      socket.onmessage = (event) => {
        const quotes = JSON.parse(event.data);

        if (Array.isArray(quotes)) {
          const newQuotes = [...this.quotes];
          const newTickerStats = { ...this.tickerStats };

          quotes.forEach((quote) => {
            if (quote.ticker && quote.last_price !== undefined) {
              if (newTickerStats[quote.ticker]) {
                newTickerStats[quote.ticker]++;
              } else {
                newTickerStats[quote.ticker] = 1;
              }

              newQuotes.push(quote);

              if (newQuotes.length > 500) {
                newQuotes.shift();
              }
            } else {
              console.warn("Invalid quote data:", quote);
            }
          });

          this.cacheQuotes = this.collectQuoteData(newQuotes);
          this.quotes = newQuotes;
          this.tickerStats = newTickerStats;
        } else {
          console.warn("Received non-array data:", quotes);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    },
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
