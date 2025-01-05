<template>
  <div style="margin-bottom: 10px;">
    <label style="position: relative;">
      <input type="checkbox" v-model="isSaveEnabled" style="position: absolute; left: 0; top: -1px;"/>
      <span style="padding-left: 20px;">Включить сохранение в базу данных</span>
    </label>
    </div>

    <div style="margin: 0 0 5px;">
    <input type="text" v-model="profitPercent"/>
    </div>

    <AlorAdvantageousDeals
        title="Выгодные сделки (Покупки)"
        :deals="tradesStore?.tradesStatistics?.advantageousBuyDifferences"
        operation="Buy"
        @select-ticker="selectTicker"
    />

    <AlorAdvantageousDeals
        title="Выгодные сделки (Продажи)"
        :deals="tradesStore?.tradesStatistics?.advantageousSellDifferences"
        operation="Sell"
        @select-ticker="selectTicker"
    />
</template>
<script>

import { useTradesStore } from '@/stores/tradesStore';

import AlorAdvantageousDeals from "@/components/AlorAdvantageousDeals.vue";

export default {

  setup() {
    const tradesStore = useTradesStore();
    return { tradesStore }
  },

  data() {
    return {
      isSaveEnabled: false,
      profitPercent: 0.2,
    }
  },

  components: {
    AlorAdvantageousDeals,
  },

  methods: {
    selectTicker(ticker){
      this.selectedTicker = ticker;
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },
  }
}

</script>