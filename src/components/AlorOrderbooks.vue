<template>
  <div>

  </div>
</template>


<script>
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';

export default {
  name: 'alor-order-book',
  data() {
    return {
      orderbookCounter: 0,

      tickersSteps,
      tickers,


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

    marketSummary() {
      const summary = {};

      // Обработка данных ордербука
      this.orderbooks.forEach((orderbook) => {
        const { ticker } = orderbook;

        // Преобразуем строки цен в числа для расчетов
        const bids = orderbook.bids.map(bid => ({ ...bid, price: parseFloat(bid.price) }));
        const asks = orderbook.asks.map(ask => ({ ...ask, price: parseFloat(ask.price) }));


        // Лучшая цена Bid
        const bestBidPrice = Math.max(...bids.map(bid => bid.price));

        // Лучшая цена Ask
        const bestAskPrice = Math.min(...asks.map(ask => ask.price));

        // Разница между лучшими ценами (спред)
        const spread = bestAskPrice - bestBidPrice;

        // Суммарный объем Bid
        const totalBidVolume = bids.reduce((sum, bid) => sum + bid.volume, 0);

        // Суммарный объем Ask
        const totalAskVolume = asks.reduce((sum, ask) => sum + ask.volume, 0);

        // Общий объем в стакане
        const totalDepth = totalBidVolume + totalAskVolume;

        // Лучший объем в стакане
        const bestDepth = (bids[0]?.volume || 0) + (asks[0]?.volume || 0);

        // Средняя цена Bid
        const averageBidPrice = bids.reduce((sum, bid) => sum + bid.price * bid.volume, 0) / totalBidVolume;

        // Средняя цена Ask
        const averageAskPrice = asks.reduce((sum, ask) => sum + ask.price * ask.volume, 0) / totalAskVolume;

        // Общий дисбаланс объемов
        const volumeImbalance = totalBidVolume - totalAskVolume;

        // Средняя цена всех заявок (Bid и Ask)
        const averageDepthPrice =
            (bids.reduce((sum, bid) => sum + bid.price * bid.volume, 0) +
                asks.reduce((sum, ask) => sum + ask.price * ask.volume, 0)) /
            (totalBidVolume + totalAskVolume);

        summary[ticker] = summary[ticker] || {};

        summary[ticker].orderbookBestBidPrice = bestBidPrice;
        summary[ticker].orderbookBestAskPrice = bestAskPrice;
        summary[ticker].orderbookSpread = spread;
        summary[ticker].orderbookTotalBidVolume = totalBidVolume;
        summary[ticker].orderbookTotalAskVolume = totalAskVolume;
        summary[ticker].orderbookTotalDepth = totalDepth;
        summary[ticker].orderbookBestDepth = bestDepth;
        summary[ticker].orderbookAverageBidPrice = averageBidPrice;
        summary[ticker].orderbookAverageAskPrice = averageAskPrice;
        summary[ticker].orderbookVolumeImbalance = volumeImbalance;
        summary[ticker].orderbookAverageDepthPrice = averageDepthPrice;

        Object.entries(orderbook).forEach(([key, value]) => {
          const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          summary[ticker][`orderbook${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`] = value;
        });

      });

      return summary;
    },

    sortedOrderbookGlobalStats() {
      return Object.fromEntries(
          Object.entries(this.orderbookGlobalStats).sort(([, a], [, b]) => b - a)
      );
    },

    groupedOrderbookLastStats() {
      return this.orderbooks.reduce((acc, order) => {
        const ticker = order.ticker;
        if (!acc[ticker]) acc[ticker] = [];
        acc[ticker].push(order);
        return acc;
      }, {});
    },

    sortedOrderbookLastStats() {
      const grouped = this.groupedOrderbookLastStats;
      return Object.fromEntries(
          Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length)
      );
    },

    sortedOrderbooksStats() {
      return Object.entries(this.groupedOrderbookLastStats)
          .sort(([, a], [, b]) => b.length - a.length)
          .reduce((acc, [key, value]) => {
            acc[key] = value.length;
            return acc;
          }, {});
    },
    
  },

  methods: {

    connectToWebSocket() {
      // Устанавливаем соединение с WebSocket сервером
      const socket = new WebSocket('wss://refine.video/orderbooks/');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {
        const newOrderbooks = JSON.parse(event.data);

        if (Array.isArray(newOrderbooks)) {

          const localOrderbooks = [...this.orderbooks];
          let orderbookCounter = this.orderbookCounter;
          const orderbookGlobalStats = { ...this.orderbookGlobalStats };

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
          this.$emit('update-orderbooks-summary', this.marketSummary);

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


