<template>
  <div style="background: white; overflow: hidden;">
    <h2>Real-time Candlestick Data</h2>

    <div style="float: left; width: 33%;">
      <div v-for="(candles, ticker) in groupedCandles"
           :key='candles.id'
           style="display: flex;">

        <div style="width: 60px;">{{ticker}}:</div>

        <div style="width: 80px">{{candles[candles.length-1].close}}</div>

        <div v-for="candle in candles" :key="candle.id">
          .
          <!--{{candle.close}} | {{ candle.volume }}-->
          <!--Time: {{ new Date(candle.time * 1000).toLocaleString() }}-->
        </div>

      </div>
    </div>

    <div style="float: left; width: 33%;">
      <div v-for="item in sortedTickerStats()"
           :key="item.id"
           style="display: flex;">
        <div style="width: 50px;">{{item.ticker}}:</div>
        <div style="width: 50px;">{{item.count}}</div>
        <div style="width: 50px;">{{groupedCandles[item.ticker] ? groupedCandles[item.ticker][groupedCandles[item.ticker].length-1].close : null}}</div>
        <div v-for="candle in groupedCandles[item.ticker]" :key="candle.id">.</div>
      </div>
    </div>

    <div style="float: left; width: 33%;">
      <div v-for="item in sortedTickerStats()"
           :key="item.id">
        <div v-if="item.ticker === 'ALRS' || item.ticker === 'CHMF'"
             style="display: flex;">
          <div style="width: 50px;">{{item.ticker}}:</div>
          <div style="width: 50px;">{{item.count}}</div>
          <div style="width: 50px;">{{groupedCandles[item.ticker] ? groupedCandles[item.ticker][groupedCandles[item.ticker].length-1].close : null}}</div>
          <div v-for="candle in groupedCandles[item.ticker]" :key="candle.id">.</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'alor-candles',
  data() {
    return {
      tickerStats: {},

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

      candles: [], // Массив для хранения данных о свечах
    };
  },
  computed: {
    // Обратный порядок для отображения актуальных данных в начале
    reversedCandles() {
      return this.candles.slice().reverse(); // Возвращаем перевернутую копию массива
    },

    groupedCandles() {
      if (!this.candles) return;

      const sortByCount = true;

      // Группировка свечей по тикерам
      let grouped = this.candles.reduce((acc, candle) => {
        const ticker = candle.ticker;
        if (!acc[ticker]) {
          acc[ticker] = [];
        }
        acc[ticker].push(candle);
        return acc;
      }, {});

      // Опциональная сортировка
      if (sortByCount) {
        // Сортировка по количеству элементов в массивах
        grouped = Object.entries(grouped)
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
      } else {
        // Сортировка по алфавиту по тикерам (ключам)
        grouped = Object.keys(grouped)
            .sort()
            .reduce((acc, key) => {
              acc[key] = grouped[key];
              return acc;
            }, {});
      }

      return grouped;
    },


  },
  mounted() {
    this.connectToWebSocket();
  },
  methods: {

    sortedTickerStats() {

      const result = [];

      // Перебираем ключи объекта
      for (const ticker in this.tickerStats) {
        if (this.tickerStats[ticker]) {
          // Добавляем объект в массив
          result.push({ ticker: ticker, count: this.tickerStats[ticker] });
        }
      }

      // Сортируем массив по значению count в порядке убывания
      result.sort(function(a, b) {
        return b.count - a.count;
      });

      return result;
    },

    connectToWebSocket() {
      // Устанавливаем соединение с WebSocket сервером на порту 3333
      const socket = new WebSocket('ws://localhost:3333');

      // Обрабатываем получение сообщений от WebSocket сервера
      socket.onmessage = (event) => {
        const candle = JSON.parse(event.data);

        // Проверка на наличие всех необходимых полей
        if (candle.ticker && candle.time && candle.open !== undefined &&
            candle.close !== undefined && candle.high !== undefined &&
            candle.low !== undefined && candle.volume !== undefined) {


          if (this.tickerStats[candle.ticker]) {
            this.tickerStats[candle.ticker]++;
          } else {
            this.tickerStats[candle.ticker] = 1;
          }

          this.candles.push(candle);
          // Сохраняем только последние 100 свечей для оптимизации
          if (this.candles.length > 100) {
            this.candles.shift();
          }
        } else {
          console.warn('Received invalid candle data:', candle); // Логирование некорректных данных
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
ul {
  list-style-type: none;
  padding-left: 0;
}
li {
  margin-bottom: 10px;
}
</style>
