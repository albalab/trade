<template>
  <div class="trade-history">
    <h3>{{ title }}</h3>
    <div v-if="showTickerInput">
      <input v-model="selectedTicker" placeholder="Enter ticker" />
    </div>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeData"
          :key="`trade-${index}`"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div class="trade-cell">{{ trade }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeData)) * 100}%` }">
          <div class="block">
            <div
                v-if="buyData"
                class="buy-bar"
                :style="{ width: `${(buyData[index] / trade) * 100}%` }"
            ></div>
            <div
                v-if="sellData"
                class="sell-bar"
                :style="{ width: `${(sellData[index] / trade) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TradeHistory",
  props: {
    title: {
      type: String,
      required: true,
    },
    tradeData: {
      type: Array,
      required: true,
    },
    buyData: {
      type: Array,
      default: null,
    },
    sellData: {
      type: Array,
      default: null,
    },
    showTickerInput: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedTicker: "",
    };
  },
};
</script>

<style scoped>
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

.trade-cell {
  width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
}
</style>
