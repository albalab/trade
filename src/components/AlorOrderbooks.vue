<template>
  <div>
    <StatisticRenderer
        :items="orderbooksStore.newOrderbooks"
    />
  </div>
</template>


<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';
import StatisticRenderer from "@/components/StatisticRenderer.vue";
import webSocketService from "@/services/WebSocketService";

export default {
  name: 'alor-order-book',

  components: {
    StatisticRenderer
  },

  setup() {
    const orderbooksStore = useOrderbooksStore();
    return { orderbooksStore }
  },

  data() {
    return {

      orderbooksMetrics: {},
      groupedOrderbooks: {},
      sortedOrderbooksStats: {},
      
      orderbookCounter: 0,

      tickersSteps,
      tickers,

      newOrderbooks: [],
      orderbooks: [],
      orderbookGlobalStats: tickers.reduce((obj, ticker) => ({ ...obj, [ticker]: 0 }), {}),
    };
  },

  computed: {

  },

  methods: {

    handleOrderbooksUpdate(data){

      /*const newCandles = data.filter((item) => item.type === "newCandles");
      const collectedClosePrice = data.find((item) => item.type === "collectedClosePrice");
      const candlesMetrics = data.find((item) => item.type === "candlesMetrics");
      const candlesStats = data.find((item) => item.type === "candlesStats");
      const accumulatedCandlesStats = data.find((item) => item.type === "accumulatedCandlesStats");
      const candleCounter = data.find((item) => item.type === "candleCounter");
      const itemsFixedArray = data.find((item) => item.type === "itemsFixedArray");*/

      //const sortedOrderbooksStats = data.filter(item => item.type === 'sortedOrderbooksStats');

      const newOrderbooks = data.filter((item) => item.type === "newOrderbooks");
      const orderbooksMetrics = data.filter(item => item.type === 'orderbooksMetrics');
      const orderbooksStats = data.find((item) => item.type === "orderbooksStats");
      const accumulatedOrderbooksStats = data.find((item) => item.type === "accumulatedOrderbooksStats");
      const orderbooksCounter = data.find((item) => item.type === "orderbooksCounter");
      const itemsFixedArray = data.find((item) => item.type === "itemsFixedArray");

      this.orderbooksStore.newOrderbooks = newOrderbooks[0].data;

      this.orderbooksStore.orderbooksMetrics = orderbooksMetrics.data;
      this.orderbooksStore.accumulatedOrderbooksStats = accumulatedOrderbooksStats.data;
      this.orderbooksStore.orderbooksStats = orderbooksStats.data;
      this.orderbooksStore.orderbooksFixedArray = itemsFixedArray.data;
      this.orderbooksStore.orderbooksCounter = orderbooksCounter.data;

      /*
      this.orderbooksStore.orderbooksMetrics = orderbooksMetrics.length ? orderbooksMetrics[0].data : {}
      this.sortedOrderbooksStats = sortedOrderbooksStats.length ? sortedOrderbooksStats[0].data : {}
      this.orderbooksStore.newOrderbooks = newOrderbooks[0].data;
      this.orderbooksStore.orderbooksMetrics = orderbooksMetrics.data;
      this.orderbooksStore.accumulatedOrderbooksStats = accumulatedOrderbooksStats.data;
      this.orderbooksStore.orderbooksStats = orderbooksStats.data;
      this.orderbooksStore.orderbooksFixedArray = itemsFixedArray.data;
      this.orderbooksStore.orderbooksCounter = orderbooksCounter.data;*/

    },

    /*connectToWebSocket() {
      // Устанавливаем соединение с WebSocket сервером
      const socket = new WebSocket('wss://signalfabric.com/datastream/');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {

        let data = JSON.parse(event.data);
        data = data?.aggregatedOrderbooks;

        if (!Array.isArray(data)) this.handleOrderbooksData(data);

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
    }*/
  },

  mounted() {

    webSocketService.connect();
    webSocketService.subscribe("aggregatedOrderbooks", this.handleOrderbooksUpdate);

    //this.connectToWebSocket();
  },

};
</script>


