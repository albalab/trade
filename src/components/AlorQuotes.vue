<template>
  <div>

  </div>
</template>

<script>
import {tickers} from "@/tickers";
import {tickersSteps} from "@/tickersSteps";

export default {
  name: "alor-quotes",
  data() {
    return {
      sortedQuotesStats: {},
      groupedQuotes: {},
      quotesSummary: {},

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

    quotesCounters() {
      return {
        quoteCounter: this.quoteCounter,
        quotesCounters: this.sortedAccumulatedQuoteStats, //this.tickerStats,
        quotesStats: this.sortedQuotesStats,
      }
    },

    sortedAccumulatedQuoteStats() {
      return Object.fromEntries(
          Object.entries(this.accumulatedQuoteStats).sort(([, a], [, b]) => b - a)
      );
    },

    /*quotesSummary() {
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


        //summary[ticker].lastClosePrice = close;
        //summary[ticker].quoteDescription = description;
        //summary[ticker].quoteVolume = volume;
        //summary[ticker].timestampCandle = time;
      });

      return summary;
    },*/

    /*groupedQuotes() {
      if (!this.quotes) return {};

      return this.quotes.reduce((acc, quote) => {
        const ticker = quote.ticker;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(quote);
        return acc;
      }, {});
    },*/

    /*sortedQuotesStats() {
      return Object.entries(this.groupedQuotes)
          .sort(([, a], [, b]) => b.length - a.length)
          .reduce((acc, [key, value]) => {
            acc[key] = value.length;
            return acc;
          }, {});
    },*/

  },

  methods: {

    processNewQuotes(newQuotes) {
      const accumulatedStats = { ...this.accumulatedQuoteStats };

      newQuotes.forEach((quote) => {

        //quote.type = 'quote';

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


    connectToWebSocket() {
      const socket = new WebSocket('wss://refine.video/quotes/');

      socket.onmessage = (event) => {
        let data = JSON.parse(event.data);

        if (!Array.isArray(data)) return;

        const newQuotes = data.filter(item => item.type === 'quote');
        const quotesSummary = data.filter(item => item.type === 'quotesSummary');
        const groupedQuotes = data.filter(item => item.type === 'groupedQuotes');
        const sortedQuotesStats = data.filter(item => item.type === 'sortedQuotesStats');

        this.quotesSummary = quotesSummary.length ? quotesSummary[0].data : {}
        this.groupedQuotes = groupedQuotes.length ? groupedQuotes[0].data : {}
        this.sortedQuotesStats = sortedQuotesStats.length ? sortedQuotesStats[0].data : {}

        if (Array.isArray(newQuotes)) {

          const localQuotes = [...this.quotes];
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
              localQuotes.push(quote);

              quoteCounter++;

              if (localQuotes.length > 200) {
                localQuotes.shift();
              }
            } else {
              console.warn("Invalid quote data:", quote);
            }
          });

          this.cacheQuotes = this.collectQuoteData(localQuotes);
          this.quotes = localQuotes;
          this.quoteCounter = quoteCounter;
          this.tickerStats = tickerStats;

          this.$emit('update-quotes', newQuotes);
          this.$emit('update-quotes-counters', this.quotesCounters);
          this.$emit('update-quotes-summary', this.quotesSummary);

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

  mounted() {
    this.connectToWebSocket();
  },

};
</script>
