<template>
  <div style="background: white; overflow: hidden;">
    <h2>Quotes</h2>

    quoteCounter: {{quoteCounter}}<br>

    <div style="overflow: auto; height: 350px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          <h3>Total counts</h3>

          <div class="stats-diagram">
            <div v-for="(item, ticker) in sortedAccumulatedQuoteStats"
                 :key="ticker"
                 class="row">
              <div class="cell">
                <div class="ticker-info">
                    <span class="ticker"
                          @click="selectTicker(ticker)">{{ticker}}</span> {{item}}
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ width: `${100 * (item/Math.max(...Object.values(accumulatedQuoteStats)))}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3>Stream objects</h3>
          <div class="stats-diagram">
            <div v-for="(quotes, ticker) in sortedQuotesLastStats" :key="ticker" class="row">
              <div class="cell">
                <div class="ticker-info">
                  <span class="ticker" @click="selectTicker(ticker)">{{ticker}}</span>
                  {{quotes.length}}
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar"
                       :style="{ width: `${100 * (quotes.length / Math.max(...Object.values(sortedQuotesLastStats).map(q => q.length)))}%` }">
                  </div>
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
import {tickers} from "@/tickers";
import {tickersSteps} from "@/tickersSteps";

export default {
  name: "alor-quotes",
  data() {
    return {
      quoteCounter: 0,
      accumulatedQuoteStats: {}, // Накопительная статистика
      tickerStats: {},

      cacheQuotes: [],

      tickersSteps,
      tickers,

      quotes: [], // Массив для хранения данных о котировках
      orderbookGlobalStats: tickers.reduce((obj, ticker) => ({ ...obj, [ticker]: 0 }), {}),

      collectedLastPrices: {}, // Хранилище для коллекции последних цен
      maxLength: 100, // Максимальная длина массива для каждого тикера

    };
  },
  computed: {

    sortedAccumulatedQuoteStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedQuoteStats).sort(([, a], [, b]) => b - a)
      );
    },

    marketSummary() {
      const summary = {};

      // Обработка данных котировок
      this.quotes.forEach((quote) => {

        const { ticker } = quote;
        summary[ticker] = summary[ticker] || {};

        Object.entries(quote).forEach(([key, value]) => {
          const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          summary[ticker][`quote${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`] = value;
        });

        summary[ticker].quoteSpread = quote.ask - quote.bid; //Показывает "ширину" рынка. Чем меньше spread, тем ликвиднее рынок.
        summary[ticker].quoteMidPrice = (quote.ask + quote.bid) / 2; //Текущая рыночная стоимость инструмента.
        summary[ticker].quotePriceChangeAbsolute = quote.last_price - quote.prev_close_price; //Абсолютное изменение цены относительно цены закрытия предыдущего торгового дня. Используется для анализа роста или падения.
        summary[ticker].quotePriceChangePercent = (summary.quotePriceChangeAbsolute / quote.prev_close_price) * 100; //Абсолютное изменение цены относительно цены закрытия предыдущего торгового дня. Используется для анализа роста или падения.


        //summary[ticker].lastClosePrice = close;
        //summary[ticker].quoteDescription = description;
        //summary[ticker].quoteVolume = volume;
        //summary[ticker].timestampCandle = time;
      });

      return summary;
    },

    groupedQuotes() {
      if (!this.quotes) return {};

      return this.quotes.reduce((acc, quote) => {
        const ticker = quote.ticker;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(quote);
        return acc;
      }, {});
    },

    sortedQuotesLastStats() {
      const grouped = this.groupedQuotes; // Используем результаты группировки

      const sortByCount = true; // Если true — сортируем по количеству элементов, иначе по алфавиту

      if (sortByCount) {
        // Сортировка по количеству элементов
        return Object.entries(grouped)
            .sort(([, a], [, b]) => b.length - a.length) // Сортируем по длине массивов
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
      } else {
        // Сортировка по алфавиту
        return Object.keys(grouped)
            .sort() // Сортируем ключи по алфавиту
            .reduce((acc, key) => {
              acc[key] = grouped[key];
              return acc;
            }, {});
      }
    },

  },
  mounted() {
    this.connectToWebSocket();
    this.updateQuotes();
  },
  methods: {

    processNewQuotes(newQuotes) {
      const accumulatedStats = { ...this.accumulatedQuoteStats };

      newQuotes.forEach((quote) => {
        const ticker = quote.ticker;

        // Обновляем накопительную статистику
        accumulatedStats[ticker] = (accumulatedStats[ticker] || 0) + 1;

        // Добавляем котировку в массив
        this.quotes.push(quote);

        // Ограничиваем размер массива
        if (this.quotes.length > this.maxLength) {
          this.quotes.shift();
        }
      });

      this.accumulatedQuoteStats = accumulatedStats;
    },

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

    updateQuotes() {
      setTimeout(() => {
        //const mergedOrderbooks = {...this.marketSummary, ...this.orderBookData[this.orderBookData.length-1]};
        this.$emit('update-quotes-summary', this.marketSummary);
        this.updateQuotes();
      }, 500);
    },

    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/quotes/');

      socket.onmessage = (event) => {
        const newQuotes = JSON.parse(event.data);

        if (Array.isArray(newQuotes)) {

          const quotes = [...this.quotes];
          const tickerStats = { ...this.tickerStats };
          let quoteCounter = this.quoteCounter;

          this.processNewQuotes(newQuotes);

          newQuotes.forEach((quote) => {

            if (quote.ticker && quote.last_price !== undefined) {

              if (tickerStats[quote.ticker]) {
                tickerStats[quote.ticker]++;
              } else {
                tickerStats[quote.ticker] = 1;
              }

              //const quoteExtended = this.extendObject(quote, "quote");
              quotes.push(quote);

              quoteCounter++;

              if (quotes.length > 200) {
                quotes.shift();
              }
            } else {
              console.warn("Invalid quote data:", quote);
            }
          });

          this.cacheQuotes = this.collectQuoteData(quotes);
          this.quotes = quotes;
          this.quoteCounter = quoteCounter;
          this.tickerStats = tickerStats;
        } else {
          console.warn("Received non-array data:", newQuotes);
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
