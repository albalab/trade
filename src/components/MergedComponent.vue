<template>
  <div>
    <div style="margin: 0 0 10px;">
      <button @click="resetCache">Reset Cache</button>
    </div>
    <input type="text" v-model="selectedTicker"/>
    {{ cachedData[selectedTicker] }}<br>

    <div class="items" v-for="(item,key) in sortedBuyVolume"
         :key="item.id" style="display: flex;">

      <div class="item" style="width: 60px;">{{key}}:</div>
      <div class="item" :style="{color: item?.lastTradeSide === 'buy' ? 'green' : 'red' }">{{item?.lastTradeSide}}</div>
      <div class="item" :style="{color: 'green'}">{{item?.buyVolume}}</div>
      <div class="item" :style="{color: 'red'}">{{item?.sellVolume}}</div>

    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
      <div>
        <AlorTrades @update-trades="updateTrades"/>
      </div>
      <div>
        <AlorOrderbooks @update-orderbooks="updateOrderbooks"/>
      </div>
      <div>
        <AlorCandles @update-candles="updateCandles"/>
      </div>
    </div>
  </div>
</template>

<script>
import AlorTrades from './AlorTrades.vue';
import AlorOrderbooks from './AlorOrderbooks.vue';
import AlorCandles from './AlorCandles.vue';

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
  },

  data() {
    return {

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
.items{
  display: flex;
}
.items .item{
  padding: 2px 10px;
}
</style>
