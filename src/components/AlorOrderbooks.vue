<template>
  <div style="background: white; overflow: hidden;">
    <h2>Real-time Order Book Data</h2>
    <div v-for="(order, index) in orderBookData.slice(-10).reverse()" :key="index" style="margin-bottom: 20px;">
      <h3>{{ order.ticker }}</h3>
      <div>Last Bid: {{ order.bids[0]?.price }} | Volume: {{ order.bids[0]?.volume }}</div>
      <div>Last Ask: {{ order.asks[0]?.price }} | Volume: {{ order.asks[0]?.volume }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alor-order-book',
  data() {
    return {
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
      orderBookData: [] // Массив для хранения данных о стаканах
    };
  },
  mounted() {
    this.connectToWebSocket();
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
