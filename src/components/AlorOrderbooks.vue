<template>
  <div style="background: white; overflow: hidden;">

    <div style="background: rgba(255, 0, 0, 0.3); padding: 10px;">Срочно покупай!</div>

    <div style="padding: 10px;"><button>Купить лимиткой</button></div>

    <h2>Real-time Order Book Data</h2>

    {{ globalCounter }}<br>



    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
      <div>
        <h3>Сортировка по названиям</h3>
        <ul>
          <li v-for="(value, key) in sortedByName" :key="key">
            {{ key }}: {{ value }}
          </li>
        </ul>
      </div>
      <div>
        <h3>Сортировка по числу</h3>
        <ul>
          <li v-for="(value, key) in sortedByValue" :key="key">
            {{ key }}: {{ value }}
          </li>
        </ul>
      </div>
      <div>
        <h3>Сортировка статистики по последним 1000</h3>
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
export default {
  name: 'alor-order-book',
  data() {
    return {
      globalCounter: 0,

      tickers: [
        'KRKNP',
        'VSMO',
        'LNZL',
        'RKKE',
        'UNKL',
        'CHMK',
        'LNZLP',
        'AKRN',
        'MGTSP',
        'BELU',
        'HEAD',
        'KROT',
        'PHOR',
        'AQUA',
        'BANE',
        'BANEP',
        'DIAS',
        'GCHE',
        'KAZTP',
        'LENT',
        'LKOH',
        'MBNK',
        'MGNT',
        'NKHP',
        'NSVZ',
        'OZON',
        'PLZL',
        'SMLT',
        'SVAV',
        'TCSG',
        'TRNFP',
        'VRSB',
        'YDEX',
        'ABRD',
        'AGRO',
        'CHMF',
        'CIAN',
        'KAZT',
        'LSRG',
        'NVTK',
        'PMSBP',
        'POSI',
        'QIWI',
        'SFIN',
        'VKCO',
        'FIXP',
        'GEMC',
        'GTRK',
        'HNFG',
        'KMAZ',
        'KZOS',
        'LEAS',
        'MDMG',
        'MVID',
        'PIKK',
        'PMSB',
        'RNFT',
        'SPBE',
        'TATN',
        'TATNP',
        'ASTR',
        'DELI',
        'ENPG',
        'EUTR',
        'GLTR',
        'IRKT',
        'IVAT',
        'LSNGP',
        'MSTT',
        'MTLRP',
        'MTSS',
        //'NKNC ',
        'PRMD',
        'RASP',
        'ROSN',
        'RTKMP',
        'SIBN',
        'UWGN',
        'VEON-RX',
        'VSEH',
        'YAKG',
        'ZAYM',
        'ABIO',
        'AMEZ',
        'CNTL',
        'CNTLP',
        'DATA',
        'DSKY',
        'ETLN',
        'GMKN',
        'NKNCP',
        'NLMK',
        'RENI',
        'SOFL',
        'TRMK',
        'AFLT',
        'ALRS',
        'BLNG',
        'BSPB',
        'FESH',
        'FLOT',
        'GAZP',
        'GECO',
        'KLSB',
        'KZOSP',
        'LSNG',
        'MAGEP',
        'MOEX',
        'MTLR',
        'OKEY',
        'RTKM',
        'SBER',
        'SBERP',
        'SELG',
        'VTBR',
        'WUSH',
        'LIFE',
        'MAGN',
        'NMTP',
        'RBCM',
        'RUAL',
        'SNGS',
        'SNGSP',
        'SVCB',
        'APTK',
        'KLVZ',
        'PRFN',
        'AFKS',
        'CBOM',
        'DVEC',
        'SGZH',
        'UPRO',
        'CARM',
        'IRAO',
        'MGKL',
        'MRKS',
        'MSNG',
        'MSRS',
        'TTLK',
        'UNAC',
        'ELFV',
        'MRKC',
        'MRKU',
        'ROLO',
        'HYDR',
        'MRKP',
        'OGKB',
        'UGLD',
        'MRKV',
        'MRKY',
        'MRKZ',
        'ELMT',
        'FEES',
        'TGKBP',
        'TGKN',
        'TGKB',
        'TGKA',
        'IMOEX2'
      ],
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
  },

  computed: {
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
    connectToWebSocket() {
      // Устанавливаем соединение с WebSocket сервером
      const socket = new WebSocket('ws://localhost:2506');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {
        const orderBook = JSON.parse(event.data);

        // Проверяем, содержит ли сообщение нужные данные
        if (orderBook.ticker && orderBook.bids && orderBook.asks) {
          this.orderBookData.push(orderBook);

          this.globalCounter++;

          this.orderBookStats[orderBook.ticker]++;

          // Ограничиваем массив последних 1000 объектов
          if (this.orderBookData.length > 1000) {
            this.orderBookData.shift();
          }
        } else {
          console.warn('Received invalid order book data:', orderBook); // Логирование некорректных данных
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
