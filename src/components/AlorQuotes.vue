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


      const defaultValues = {
        sourceQuotesCount: 0,

        newQuotes: [],
        quotesMetrics: [],
        quotesStats: [],
        accumulatedQuotesStats: {},
        quotesCounter: {},
        quotesFixedArray: {}
      };

      const quotesStoreData = data.reduce((acc, item) => {
        if (item.type in defaultValues) {
          acc[item.type] = item.data || defaultValues[item.type];
        }
        return acc;
      }, { ...defaultValues });

      Object.assign(this.quotesStore, quotesStoreData);


    },

  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedQuotes", this.handleQuotesUpdate);

    //this.connectToWebSocket();
  },

  unmounted() {
    webSocketService.close();
  },

};
</script>
