<template>
  <div style="background: white; overflow: hidden;">

    <h2>Orderbooks</h2>

    
    orderbookCounter: {{ orderbookCounter }}<br>

    <div style="overflow: auto; height: 350px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <div>
            <h3>Все стаканы</h3>
            <div class="stats-diagram">
              <div class="inner">
                <div v-for="(item, ticker) in sortedOrderbookGlobalStats"
                     :key="item.id"
                     class="row">
                  <div class="cell">
                    <div class="ticker-info">
                      <span class="ticker"
                            @click="selectTicker(ticker)">{{ticker}}</span> {{item}}
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar" :style="{ width: `${100 * (item/Math.max(...Object.values(sortedOrderbookGlobalStats)))}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3>Последние 200</h3>

            <div class="stats-diagram">
              <div class="inner">
                <div v-for="(item, ticker) in sortedOrderbookLastStats"
                     :key="item.id"
                     class="row">
                  <div class="cell">
                    <div class="ticker-info">
                      <span class="ticker"
                            @click="selectTicker(ticker)">{{ticker}}</span> {{item}}
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar" :style="{ width: `${100 * (item/Math.max(...Object.values(sortedOrderbookLastStats)))}%` }"></div>
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
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';

export default {
  name: 'alor-order-book',
  data() {
    return {
      orderbookCounter: 0,

      tickersSteps,
      tickers,

      orderbook: [],
      orderbookGlobalStats: tickers.reduce((obj, ticker) => ({ ...obj, [ticker]: 0 }), {}),
    };
  },
  mounted() {
    this.connectToWebSocket();
    this.updateOrderbooks();
  },

  computed: {

    marketSummary() {
      const summary = {};

      // Обработка данных ордербука
      this.orderbook.forEach((orderbook) => {
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

    orderbookLastStats() {
      return this.orderbook.reduce((acc, item) => {
        acc[item.ticker] = (acc[item.ticker] || 0) + 1;
        return acc;
      }, {});
    },
    
    sortedOrderbookGlobalStats() {
      return Object.fromEntries(
          Object.entries(this.orderbookGlobalStats).sort(([, a], [, b]) => b - a)
      );
    },
    
    sortedOrderbookLastStats() {
      return Object.fromEntries(
          Object.entries(this.orderbookLastStats).sort(([, a], [, b]) => b - a)
      );
    },
  },

  methods: {

    selectTicker(ticker){
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");

      //console.log('Select ticker', ticker);
    },

    updateOrderbooks() {
      setTimeout(() => {
        this.$emit('update-orderbooks-summary', this.marketSummary);
        this.updateOrderbooks();
      }, 500);
    },

    connectToWebSocket() {
      // Устанавливаем соединение с WebSocket сервером
      const socket = new WebSocket('wss://refine.video/orderbooks/');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {
        const orderBooks = JSON.parse(event.data);

        // Проверяем, что пришедшие данные — массив
        if (Array.isArray(orderBooks)) {
          // Локальные переменные для накопления данных
          const neworderbook = [...this.orderbook];
          let neworderbookCounter = this.orderbookCounter;
          const neworderbookGlobalStats = { ...this.orderbookGlobalStats };

          orderBooks.forEach(orderBook => {
            // Проверяем, содержит ли каждый объект в массиве нужные данные
            if (orderBook.ticker && orderBook.bids && orderBook.asks) {

              //const orderbookExtended = this.extendObject(orderBook, "orderbook");

              neworderbook.push(orderBook);

              neworderbookCounter++;
              neworderbookGlobalStats[orderBook.ticker] = (neworderbookGlobalStats[orderBook.ticker] || 0) + 1;

              // Ограничиваем массив последних 1000 объектов
              if (neworderbook.length > 200) {
                neworderbook.shift();
              }
            } else {
              console.warn('Received invalid order book data:', orderBook); // Логирование некорректных данных
            }
          });

          // Обновляем реактивные свойства один раз после цикла
          this.orderbook = neworderbook;
          this.orderbookCounter = neworderbookCounter;
          this.orderbookGlobalStats = neworderbookGlobalStats;
        } else {
          console.warn('Received non-array data:', orderBooks); // Логирование данных, если это не массив
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
  }

};
</script>


