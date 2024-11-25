<template>
  <div class="panels-container">


    <div class="panels-grid">

      <div class="panel">
        <h2>Summary</h2>

        <div class="items">
          <div class="items-wrap"
               v-for="(item,ticker) in sortedBuyVolume"
               :key="item.id">
            <div class="item" style="width: 50px; cursor: pointer;">{{ticker}}</div>
            <div class="item">{{item?.candleClose}}</div>
            <div class="item" :style="{color: item?.tradeSide === 'buy' ? 'green' : 'red' }">{{item?.tradeSide}}</div>
            <div class="item" :style="{color: 'green'}">{{item?.tradeLastBuyVolume}}</div>
            <div class="item" :style="{color: 'red'}">{{item?.tradeLastSellVolume}}</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>Trades</h2>

        <div style="margin: 0 0 5px;">
          <input type="text" v-model="profitPercent"/>
        </div>

        <!-- Топ 10 выгодных сделок (Покупки) -->
        <AlorAdvantageousDeals
            title="Выгодные сделки (Покупки)"
            :deals="globalData?.tradesStatistics?.advantageousBuyDifferences"
            operation="Buy"
            @select-ticker="selectTicker"
        />

        <!-- Топ 10 выгодных сделок (Продажи) -->
        <AlorAdvantageousDeals
            title="Выгодные сделки (Продажи)"
            :deals="globalData?.tradesStatistics?.advantageousSellDifferences"
            operation="Sell"
            @select-ticker="selectTicker"
        />

        <!-- Статистика всех сделок -->
<!--        <AlorTradeHistoryDiagram
            title="Trade History Statistics (All)"
            :tradeData="globalData?.tradesStatistics?.tradeHistory"
            :buyData="globalData?.tradesStatistics?.tradeHistoryBuy"
            :sellData="globalData?.tradesStatistics?.tradeHistorySell"
        />-->


<!--        <input type="text" v-model="selectedTicker"/>-->

        <!-- Статистика выбранного тикера -->
<!--        <AlorTradeHistoryDiagram
            title="Trade History Statistics (By Ticker)"
            :tradeData="globalData?.tradesStatistics?.tickerStats[selectedTicker]?.tradeHistory || []"
            :buyData="globalData?.tradesStatistics?.tickerStats[selectedTicker]?.tradeHistoryBuy || []"
            :sellData="globalData?.tradesStatistics?.tickerStats[selectedTicker]?.tradeHistorySell || []"
            :showTickerInput="true"
        />-->

        <!-- Статистика покупок -->
<!--        <AlorTradeHistoryDiagram
            title="Trade History Statistics (Buy)"
            type="buy"
            :tradeData="globalData?.tradesStatistics?.tradeHistoryBuy"
        />-->

        <!-- Статистика продаж -->
<!--        <AlorTradeHistoryDiagram
            title="Trade History Statistics (Sell)"
            type="sell"
            :tradeData="globalData?.tradesStatistics?.tradeHistorySell"
        />-->


        <AlorStatsDiagram
            :totalCounts="globalData?.tradesCounters?.tradesCounters"
            :streamObjects="globalData?.tradesCounters?.tradesStats"
            @select-ticker="selectTicker"
        />

        <AlorTradesPlus
            :profitPercent="profitPercent"
            @update-trades-statistics="updateTradesStatistics"
            @update-trades-counters="updateTradesCounters"
            @update-trades-summary="updateTrades"/>
      </div>
      <div class="panel">

        <h2>Orderbooks</h2>

        <AlorStatsDiagram
            :totalCounts="globalData?.orderbooksCounters?.orderbooksCounters"
            :streamObjects="globalData?.orderbooksCounters?.orderbooksStats"
            @select-ticker="selectTicker"
        />

        <AlorOrderbooksPlus
            @update-orderbooks-counters="updateOrderbooksCounters"
            @update-orderbooks-summary="updateOrderbooks"/>
      </div>
      <div class="panel">

        <h2>Candles</h2>

        <AlorStatsDiagram
            :totalCounts="globalData?.candlesCounters?.candlesCounters"
            :streamObjects="globalData?.candlesCounters?.candlesStats"
            @select-ticker="selectTicker"
        />

        <AlorCandlesPlus
            @update-candles-counters="updateCandlesCounters"
            @update-candles-summary="updateCandles"/>
      </div>
      <div class="panel">

        <h2>Quotes</h2>

        <AlorStatsDiagram
            :totalCounts="globalData?.quotesCounters?.quotesCounters"
            :streamObjects="globalData?.quotesCounters?.quotesStats"
            @select-ticker="selectTicker"
        />

        <AlorQuotesPlus
            @update-quotes-counters="updateQuotesCounters"
            @update-quotes-summary="updateQuotes"/>
      </div>
    </div>


    <div style="padding: 10px;">
      <input v-model="priceOrder" placeholder="price"><br>
      <input v-model="tickerOrder" placeholder="ticker"><br>
      <input v-model="sideOrder" placeholder="side"><br>
      <button @click="sendLimitOrder(1, priceOrder, tickerOrder, 'MOEX', sideOrder, 'D88141')">
        Отправить лимитный ордер
      </button>
    </div>

    <div style="margin: 0 0 10px;">
      <button @click="resetCache">Reset Cache</button>
    </div>

    <div style="margin: 0 0 10px;">
      <div v-for="(item, key) in {
        ...globalData.tradesCounters,
        ...globalData.candlesCounters,
        ...globalData.orderbooksCounters,
        ...globalData.quotesCounters}" :key="key">
        {{key}}: {{item}}
      </div>
    </div>


<!--    <input type="text" v-model="selectedTicker"/><br>
    <div style="padding: 10px;">
      <div v-for="(item, key) in summaryData[selectedTicker]" :key="item?.id">
        {{key}}: {{item}}
      </div>
    </div>-->

  </div>
</template>

<script>
import { sendLimitOrder as importedSendLimitOrder } from '../modules/LimitOrderModule.js';
import AlorTradesPlus from './AlorTradesPlus.vue';
import AlorOrderbooksPlus from './AlorOrderbooksPlus.vue';
import AlorCandlesPlus from './AlorCandlesPlus.vue';
import AlorQuotesPlus from './AlorQuotesPlus.vue';
import AlorStatsDiagram from './AlorStatsDiagram.vue';
import AlorAdvantageousDeals from './AlorAdvantageousDeals.vue';
//import AlorTradeHistoryDiagram from './AlorTradeHistoryDiagram.vue';

import { useCacheStore } from '@/stores/cacheStore';

export default {
  name: 'MergedComponent',

  setup() {
    const cacheStore = useCacheStore();

    // Функция для сброса состояния в Pinia
    const resetCache = () => {
      cacheStore.resetStore(); // Вызов метода сброса в Pinia
    };

    return {
      resetCache,
    };
  },

  components: {
    AlorTradesPlus,
    AlorOrderbooksPlus,
    AlorCandlesPlus,
    AlorQuotesPlus,
    AlorStatsDiagram,
    AlorAdvantageousDeals,
    //AlorTradeHistoryDiagram,
  },

  data() {
    return {

      profitPercent: 0.2,

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',

      globalData: {},
      selectedTicker: 'SBER',
      summaryData: {},
    }
  },

  computed: {
    sortedBuyVolume() {
      if (!this.summaryData || Object.keys(this.summaryData).length === 0) {
        return {}; // Возвращаем пустой объект, если данных еще нет
      }

      const sortedEntries = Object.entries(this.summaryData).sort((a, b) => {
        return (b[1].tradeVolume || 0) - (a[1].tradeVolume || 0);
      });

      return Object.fromEntries(sortedEntries);
    }
  },

  methods: {

    updateOrderbooks(orderbooks) {
      this.globalData.orderbooks = orderbooks;
    },
    updateCandles(candles) {
      this.globalData.candles = candles;
    },
    updateQuotes(quotes) {
      this.globalData.quotes = quotes;
    },
    updateTrades(trades) {
      this.globalData.trades = trades;
    },

    updateTradesStatistics(tradesStatistics) {
      this.globalData.tradesStatistics = tradesStatistics;
    },

    updateTradesCounters(tradesCounters) {
      this.globalData.tradesCounters = tradesCounters;
    },
    updateCandlesCounters(candlesCounters) {
      this.globalData.candlesCounters = candlesCounters;
    },
    updateOrderbooksCounters(orderbooksCounters) {
      this.globalData.orderbooksCounters = orderbooksCounters;
    },
    updateQuotesCounters(quotesCounters) {
      this.globalData.quotesCounters = quotesCounters;
    },

    sendLimitOrder: importedSendLimitOrder,

    selectTicker(ticker){
      this.selectedTicker = ticker;
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },

    updateSummaryData() {
      const data = { ...this.globalData };
      const result = { ...this.summaryData };

      // Оставляем только аггрегированные данные с тикерами
      const tickerSections = ['trades', 'candles', 'orderbooks', 'quotes']; // Укажите секции, содержащие тикеры

      for (const section in data) {
        if (!tickerSections.includes(section)) continue; // Пропускаем ненужные секции

        for (const ticker in data[section]) {
          if (!result[ticker]) result[ticker] = {}; // Инициализация объекта для тикера
          Object.assign(result[ticker], data[section][ticker]); // Объединяем данные тикера
        }
      }

      this.summaryData = result;

    },

  },

  watch: {
    globalData: {
      deep: true,
      immediate: true,
      handler() {

        if(this.timerInProgress) {
          setTimeout(() => {
            this.updateSummaryData();
          }, 600);
          return;
        }

        this.timerInProgress = true;
        setTimeout(() => {
          this.updateSummaryData();
          this.timerInProgress = false;
        }, 500);

      }
    }
  }
}
</script>

<style>

.panels-container{
  padding: 20px;
  background: #e5e5e5;
}
.panels-grid{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}
.panel{
  margin: 4px;
  padding: 10px;
  border: solid 1px #ccc;
  border-radius: 6px;
  background: white;
}

.items{
  display: table;
}
.items-wrap{
  display: table-row;
  border-bottom: solid 1px #eee;
}
.items .item{
  display: table-cell;
  padding: 1px 10px;
}


.container {
  position: relative;
}

.row {
  margin: 0 0 2px;
  display: grid;
}

.block {
  height: 10px;
  background: #ccc;
}

.buy-bar {
  height: 50%;
  background-color: green;
}

.sell-bar {
  height: 50%;
  background-color: red;
}

.trade-cell{
  width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
}
.select-ticker{
  cursor: pointer;
}
</style>
