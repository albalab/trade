<template>
  <div>
    <StatisticRenderer
        :items="newOrderbooks"
    />
  </div>
</template>


<script>
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';
import StatisticRenderer from "@/components/StatisticRenderer.vue";

export default {
  name: 'alor-order-book',
  components: {StatisticRenderer},
  data() {
    return {

      orderbooksSummary: {},
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

    orderbooksCounters() {
      return {
        orderbooksStats: this.sortedOrderbooksStats,
        orderbookCounter: this.orderbookCounter,
        orderbooksCounters: this.sortedOrderbookGlobalStats,
      }
    },

    sortedOrderbookGlobalStats() {
      return Object.fromEntries(
          Object.entries(this.orderbookGlobalStats).sort(([, a], [, b]) => b - a)
      );
    },

  },

  methods: {

    connectToWebSocket() {
      // Устанавливаем соединение с WebSocket сервером
      const socket = new WebSocket('wss://signalfabric.com/datastream/');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {

        let data = JSON.parse(event.data);
        data = data?.aggregatedOrderbooks;

        if (!Array.isArray(data)) return;
        
        const newOrderbooks = data.filter(item => item.type === 'orderbook');
        const orderbooksSummary = data.filter(item => item.type === 'orderbooksSummary');
        const groupedOrderbooks = data.filter(item => item.type === 'groupedOrderbooks');
        const sortedOrderbooksStats = data.filter(item => item.type === 'sortedOrderbooksStats');

        this.orderbooksSummary = orderbooksSummary.length ? orderbooksSummary[0].data : {}
        this.groupedOrderbooks = groupedOrderbooks.length ? groupedOrderbooks[0].data : {}
        this.sortedOrderbooksStats = sortedOrderbooksStats.length ? sortedOrderbooksStats[0].data : {}

        
        if (Array.isArray(newOrderbooks)) {
          
          const localOrderbooks = [...this.orderbooks];
          let orderbookCounter = this.orderbookCounter;
          const orderbookGlobalStats = { ...this.orderbookGlobalStats };

          this.newOrderbooks = newOrderbooks;

          newOrderbooks.forEach(orderbook => {

            if (orderbook.ticker && orderbook.bids && orderbook.asks) {

              localOrderbooks.push(orderbook);

              orderbookCounter++;
              orderbookGlobalStats[orderbook.ticker] = (orderbookGlobalStats[orderbook.ticker] || 0) + 1;


              // Ограничиваем массив последних 1000 объектов
              if (localOrderbooks.length > 500) {
                localOrderbooks.shift();
              }

            } else {
              console.warn('Received invalid order book data:', orderbook); // Логирование некорректных данных
            }
          });

          // Обновляем реактивные свойства один раз после цикла
          this.orderbooks = localOrderbooks;
          this.orderbookCounter = orderbookCounter;
          this.orderbookGlobalStats = orderbookGlobalStats;

          //console.log(this.orderbooks[0])

          this.$emit('update-orderbooks', newOrderbooks);
          this.$emit('update-orderbooks-counters', this.orderbooksCounters);
          this.$emit('update-orderbooks-summary', this.orderbooksSummary);

        } else {
          console.warn('Received non-array data:', newOrderbooks); // Логирование данных, если это не массив
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

  mounted() {
    this.connectToWebSocket();
  },

};
</script>


