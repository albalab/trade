<template>
  <div class="panels-container">

    <div style="background: rgba(255, 0, 0, 0.3); padding: 10px;">Срочно покупай!</div>

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

    <input type="text" v-model="selectedTicker"/><br>
    <div style="padding: 10px;">
      {{ cachedData[selectedTicker] }}<br>
    </div>


    <div class="panels-grid">

      <div class="panel">
        <div class="items">
          <div class="items-wrap"
               v-for="(item,key) in sortedBuyVolume"
               :key="item.id">
            <div class="item" style="width: 60px;">{{key}}:</div>
            <div class="item">{{item?.lastClosePrice}}</div>
            <div class="item">{{item?.lastClosePriceLevel}}</div>
            <div class="item" :style="{color: item?.lastTradeSide === 'buy' ? 'green' : 'red' }">{{item?.lastTradeSide}}</div>
            <div class="item" :style="{color: 'green'}">{{item?.buyVolume}}</div>
            <div class="item" :style="{color: 'red'}">{{item?.sellVolume}}</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <AlorTrades @update-trades="updateTrades"/>
      </div>
      <div class="panel">
        <AlorOrderbooks @update-orderbooks="updateOrderbooks"/>
      </div>
      <div class="panel">
        <AlorCandles @update-candles="updateCandles"/>
      </div>
      <div class="panel">
        <AlorQuotes @update-quotes="updateQuotes"/>
      </div>
    </div>
  </div>
</template>

<script>
import { sendLimitOrder as importedSendLimitOrder } from '../modules/LimitOrderModule.js';
import AlorTrades from './AlorTrades.vue';
import AlorOrderbooks from './AlorOrderbooks.vue';
import AlorCandles from './AlorCandles.vue';
import AlorQuotes from './AlorQuotes.vue';

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
    AlorTrades,
    AlorOrderbooks,
    AlorCandles,
    AlorQuotes,
  },

  data() {
    return {

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',

      globalData: {},
      selectedTicker: 'SBER',
      cachedData: {},
    }
  },

  computed: {
    sortedBuyVolume() {
      if (!this.cachedData || Object.keys(this.cachedData).length === 0) {
        return {}; // Возвращаем пустой объект, если данных еще нет
      }

      const sortedEntries = Object.entries(this.cachedData).sort((a, b) => {
        return (b[1].buyVolume || 0) - (a[1].buyVolume || 0);
      });

      return Object.fromEntries(sortedEntries);
    }
  },

  methods: {
    updateOrderbooks(orderbooks) {
      this.globalData.orderbooks = orderbooks;
    },
    updateTrades(trades) {
      this.globalData.trades = trades;
    },
    updateCandles(candles) {
      this.globalData.candles = candles;
    },
    updateQuotes(quotes) {
      this.globalData.quotes = quotes;
    },

    sendLimitOrder: importedSendLimitOrder,

    updateCachedData() {
      const data = this.globalData;
      const result = { ...this.cachedData }; // Копируем текущие данные

      for (const section in data) {
        for (const key in data[section]) {
          if (!result[key]) result[key] = {};
          Object.assign(result[key], data[section][key]);
        }
      }

      this.cachedData = result; // Обновляем кэшированные данные
    },
  },

  watch: {
    globalData: {
      deep: true,
      immediate: true,
      handler() {
        this.updateCachedData(); // Обновляем кэшированные данные при изменении globalData
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
</style>
