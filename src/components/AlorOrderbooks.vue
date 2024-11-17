<template>
  <div style="background: white; overflow: hidden;">

    <h2>Real-time Order Book Data</h2>

    {{ globalCounter }}<br>



    <div style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        <h3>Сортировка по накопленному</h3>
        <ul>
          <li v-for="(value, key) in sortedByValue" :key="key">
            {{ key }}: {{ value }}
          </li>
        </ul>
      </div>
      <div>
        <h3>Сортировка по окну</h3>
        <ul>
          <li v-for="(value, key) in sortedByValueRange" :key="key">
            {{ key }}: {{ value }}
          </li>
        </ul>
      </div>
    </div>

<!--
    <div v-for="(order, index) in orderBookData.slice(-10).reverse()" :key="index" style="margin-bottom: 20px;">
      <h3>{{ order.ticker }}</h3>
      <div>Last Bid: {{ order.bids[0]?.price }} | Volume: {{ order.bids[0]?.volume }}</div>
      <div>Last Ask: {{ order.asks[0]?.price }} | Volume: {{ order.asks[0]?.volume }}</div>
    </div>
-->

  </div>
</template>

<script>
import { tickersSteps } from '../tickersSteps.js';
import { tickers } from '../tickers.js';

export default {
  name: 'alor-order-book',
  data() {
    return {
      globalCounter: 0,

      tickersSteps,
      tickers,

      orderBookData: [], // Массив для хранения данных о стаканах
      orderBookStats: {
        'KRKNP': 0,
        'VSMO': 0,
        'LNZL': 0,
        'RKKE': 0,
        'UNKL': 0,
        'CHMK': 0,
        'LNZLP': 0,
        'AKRN': 0,
        'MGTSP': 0,
        'BELU': 0,
        'HEAD': 0,
        'KROT': 0,
        'PHOR': 0,
        'AQUA': 0,
        'BANE': 0,
        'BANEP': 0,
        'DIAS': 0,
        'GCHE': 0,
        'KAZTP': 0,
        'LENT': 0,
        'LKOH': 0,
        'MBNK': 0,
        'MGNT': 0,
        'NKHP': 0,
        'NSVZ': 0,
        'OZON': 0,
        'PLZL': 0,
        'SMLT': 0,
        'SVAV': 0,
        'TCSG': 0,
        'TRNFP': 0,
        'VRSB': 0,
        'YDEX': 0,
        'ABRD': 0,
        'AGRO': 0,
        'CHMF': 0,
        'CIAN': 0,
        'KAZT': 0,
        'LSRG': 0,
        'NVTK': 0,
        'PMSBP': 0,
        'POSI': 0,
        'QIWI': 0,
        'SFIN': 0,
        'VKCO': 0,
        'FIXP': 0,
        'GEMC': 0,
        'GTRK': 0,
        'HNFG': 0,
        'KMAZ': 0,
        'KZOS': 0,
        'LEAS': 0,
        'MDMG': 0,
        'MVID': 0,
        'PIKK': 0,
        'PMSB': 0,
        'RNFT': 0,
        'SPBE': 0,
        'TATN': 0,
        'TATNP': 0,
        'ASTR': 0,
        'DELI': 0,
        'ENPG': 0,
        'EUTR': 0,
        'GLTR': 0,
        'IRKT': 0,
        'IVAT': 0,
        'LSNGP': 0,
        'MSTT': 0,
        'MTLRP': 0,
        'MTSS': 0,
        //'NKNC ': 0,
        'PRMD': 0,
        'RASP': 0,
        'ROSN': 0,
        'RTKMP': 0,
        'SIBN': 0,
        'UWGN': 0,
        'VEON-RX': 0,
        'VSEH': 0,
        'YAKG': 0,
        'ZAYM': 0,
        'ABIO': 0,
        'AMEZ': 0,
        'CNTL': 0,
        'CNTLP': 0,
        'DATA': 0,
        'DSKY': 0,
        'ETLN': 0,
        'GMKN': 0,
        'NKNCP': 0,
        'NLMK': 0,
        'RENI': 0,
        'SOFL': 0,
        'TRMK': 0,
        'AFLT': 0,
        'ALRS': 0,
        'BLNG': 0,
        'BSPB': 0,
        'FESH': 0,
        'FLOT': 0,
        'GAZP': 0,
        'GECO': 0,
        'KLSB': 0,
        'KZOSP': 0,
        'LSNG': 0,
        'MAGEP': 0,
        'MOEX': 0,
        'MTLR': 0,
        'OKEY': 0,
        'RTKM': 0,
        'SBER': 0,
        'SBERP': 0,
        'SELG': 0,
        'VTBR': 0,
        'WUSH': 0,
        'LIFE': 0,
        'MAGN': 0,
        'NMTP': 0,
        'RBCM': 0,
        'RUAL': 0,
        'SNGS': 0,
        'SNGSP': 0,
        'SVCB': 0,
        'APTK': 0,
        'KLVZ': 0,
        'PRFN': 0,
        'AFKS': 0,
        'CBOM': 0,
        'DVEC': 0,
        'SGZH': 0,
        'UPRO': 0,
        'CARM': 0,
        'IRAO': 0,
        'MGKL': 0,
        'MRKS': 0,
        'MSNG': 0,
        'MSRS': 0,
        'TTLK': 0,
        'UNAC': 0,
        'ELFV': 0,
        'MRKC': 0,
        'MRKU': 0,
        'ROLO': 0,
        'HYDR': 0,
        'MRKP': 0,
        'OGKB': 0,
        'UGLD': 0,
        'MRKV': 0,
        'MRKY': 0,
        'MRKZ': 0,
        'ELMT': 0,
        'FEES': 0,
        'TGKBP': 0,
        'TGKN': 0,
        'TGKB': 0,
        'TGKA': 0,
        'IMOEX2': 0
      },
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
      this.orderBookData.forEach((orderbook) => {
        const { ticker, bids, asks, timestamp } = orderbook;
        summary[ticker] = summary[ticker] || {};

        summary[ticker].bestBidPriceLevel = Math.round(bids[0]?.price/this.tickersSteps[ticker]) || null;
        summary[ticker].bestAskPriceLevel = Math.round(asks[0]?.price/this.tickersSteps[ticker]) || null;
        summary[ticker].spreadLevel = Math.round(summary[ticker].bestAskPriceLevel - summary[ticker].bestBidPriceLevel);

        summary[ticker].bestBidPrice = bids[0]?.price || null;
        summary[ticker].bestAskPrice = asks[0]?.price || null;
        summary[ticker].spread = (asks[0]?.price || 0) - (bids[0]?.price || 0);
        summary[ticker].spreadPercent = summary[ticker].spread / ((asks[0]?.price + bids[0]?.price) / 2) * 100;
        summary[ticker].timestampOrderbook = timestamp;
      });

      return summary;
    },

    tickerCount() {
      return this.orderBookData.reduce((acc, item) => {
        acc[item.ticker] = (acc[item.ticker] || 0) + 1;
        return acc;
      }, {});
    },
    sortedByName() {
      return Object.fromEntries(
          Object.entries(this.orderBookStats).sort(([a], [b]) => a.localeCompare(b))
      );
    },
    sortedByValue() {
      return Object.fromEntries(
          Object.entries(this.orderBookStats).sort(([, a], [, b]) => b - a)
      );
    },
    sortedByValueRange() {
      return Object.fromEntries(
          Object.entries(this.tickerCount).sort(([, a], [, b]) => b - a)
      );
    },
  },

  methods: {

    updateOrderbooks() {
      setTimeout(() => {
        this.$emit('update-orderbooks', this.marketSummary);
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
          const newOrderBookData = [...this.orderBookData];
          let newGlobalCounter = this.globalCounter;
          const newOrderBookStats = { ...this.orderBookStats };

          orderBooks.forEach(orderBook => {
            // Проверяем, содержит ли каждый объект в массиве нужные данные
            if (orderBook.ticker && orderBook.bids && orderBook.asks) {
              newOrderBookData.push(orderBook);

              newGlobalCounter++;
              newOrderBookStats[orderBook.ticker] = (newOrderBookStats[orderBook.ticker] || 0) + 1;

              // Ограничиваем массив последних 1000 объектов
              if (newOrderBookData.length > 1000) {
                newOrderBookData.shift();
              }
            } else {
              console.warn('Received invalid order book data:', orderBook); // Логирование некорректных данных
            }
          });

          // Обновляем реактивные свойства один раз после цикла
          this.orderBookData = newOrderBookData;
          this.globalCounter = newGlobalCounter;
          this.orderBookStats = newOrderBookStats;
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

<style scoped>
h3 {
  margin: 0;
  padding: 0;
}
</style>
