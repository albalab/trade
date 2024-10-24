<template>
  <div class="outer-container">

    <!-- График для сделок (BUY) -->
    <div v-if="trades.length" style="overflow: hidden;">
      <div v-for="(trade, index) in trades.filter(item => item.direction === 'TRADE_DIRECTION_BUY')" :key="index"
           class="trade"
           style="margin: 0 2px 2px; float: left; width: 2px; height: 2px; background: green; padding: 0; border-radius: 100%;"></div>
    </div>

    <!-- График для сделок (SELL) -->
    <div v-if="trades.length" style="overflow: hidden;">
      <div v-for="(trade, index) in trades.filter(item => item.direction === 'TRADE_DIRECTION_SELL')" :key="index"
           class="trade"
           style="margin: 0 2px 2px; float: left; width: 2px; height: 2px; background: red; padding: 0; border-radius: 100%;"></div>
    </div>

    <!-- Статистика -->
    <div class="statistics" style="display: grid; grid-template-columns: 1fr 1fr;">
      <div style="color: green;">
        {{ buyVolumeLastMinute }}
      </div>
      <div style="color: red;">
        {{ sellVolumeLastMinute }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      trades: [],
      buyVolumeLastMinute: 0,
      sellVolumeLastMinute: 0,
    };
  },
  mounted() {
    window.addEventListener('message', this.handleMessage, false);
  },
  beforeUnmount() {
    window.removeEventListener('message', this.handleMessage, false);
  },
  methods: {
    handleMessage(event) {
      if (event.data && event.data.type === 'trade') {
        this.handleTrade(event.data.data);
      }
    },
    handleTrade(trade) {
      if (this.trades.length > 100) {
        this.trades.shift();
      }
      this.trades.push(trade);
      this.updateTradeStatistics();
    },

    updateTradeStatistics() {
      //const currentTime = Date.now() / 1000;
      //const oneMinuteAgo = currentTime - 60;
      let buyVolume = 0;
      let sellVolume = 0;

      this.trades.forEach(trade => {
        //if (trade.time.seconds >= oneMinuteAgo) {
          if (trade.direction === "TRADE_DIRECTION_BUY") {
            buyVolume += trade.quantity;
          } else if (trade.direction === "TRADE_DIRECTION_SELL") {
            sellVolume += trade.quantity;
          }
        //}
      });

      this.buyVolumeLastMinute = buyVolume;
      this.sellVolumeLastMinute = sellVolume;
    },

  },
};
</script>

<style scoped>
.outer-container {
  width: 100%;
  height: 500px;
  position: relative;
}

.trade {
  margin: 0 2px 2px;
  float: left;
  width: 2px;
  height: 2px;
  border-radius: 100%;
}

.statistics {
  margin-top: 20px;
}
</style>
