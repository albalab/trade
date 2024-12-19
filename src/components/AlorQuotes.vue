<template>
  <div>
    <StatisticRenderer
        :items="quotesStore.newQuotes"
    />
  </div>
</template>

<script>

import { useQuotesStore } from '@/stores/quotesStore';

import {tickers} from "@/tickers";
import {tickersSteps} from "@/tickersSteps";
import StatisticRenderer from "@/components/StatisticRenderer.vue";
import webSocketService from "@/services/WebSocketService";

export default {
  name: "alor-quotes",

  components: { StatisticRenderer },

  setup() {
    const quotesStore = useQuotesStore();
    return { quotesStore }
  },

  data() {
    return {
      //sortedQuotesStats: {},
      //groupedQuotes: {},
      quotesMetrics: {},

      quoteCounter: 0,
      accumulatedQuoteStats: {}, // Накопительная статистика
      tickerStats: {},

      cacheQuotes: [],

      tickersSteps,
      tickers,

      newQuotes: [],
      quotes: [], // Массив для хранения данных о котировках
      orderbookGlobalStats: tickers.reduce((obj, ticker) => ({ ...obj, [ticker]: 0 }), {}),

      collectedLastPrices: {}, // Хранилище для коллекции последних цен
      maxLength: 100, // Максимальная длина массива для каждого тикера

    };
  },
  computed: {

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





    handleQuotesUpdate(data) {

      console.log(data)
      const newQuotes = data.filter(item => item.type === 'newQuotes');
      const quotesMetrics = data.filter(item => item.type === 'quotesMetrics');
      const quotesStats = data.filter(item => item.type === 'quotesStats');
      const accumulatedQuotesStats = data.find((item) => item.type === "accumulatedQuotesStats");
      const quotesCounter = data.find((item) => item.type === "quotesCounter");
      const itemsFixedArray = data.find((item) => item.type === "itemsFixedArray");

      this.quotesStore.quotesMetrics = quotesMetrics.length ? quotesMetrics[0]?.data : {}

      this.quotesStore.newQuotes = newQuotes[0]?.data;
      this.quotesStore.quotesMetrics = quotesMetrics?.data;
      this.quotesStore.accumulatedQuotesStats = accumulatedQuotesStats?.data;
      this.quotesStore.quotesStats = quotesStats[0]?.data;
      this.quotesStore.quotesFixedArray = itemsFixedArray?.data;
      this.quotesStore.quotesCounter = quotesCounter?.data;


    },

  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedQuotes", this.handleQuotesUpdate);

    //this.connectToWebSocket();
  },

};
</script>
