<template>
  <div class="outer-container">
    <ChartComponent :candlesticks="candlesticks"/>
  </div>
</template>

<script>
import ChartComponent from './ChartComponent.vue';

export default {
  components: {
    ChartComponent,
  },
  data() {
    return {
      // Хардкодим 10-20 свечей для примера
      candlesticks: [
        {
          figi: "BBG004731032",
          interval: "SUBSCRIPTION_INTERVAL_ONE_MINUTE",
          open: { units: 6924, nano: 500000000 },
          high: { units: 6924, nano: 500000000 },
          low: { units: 6919, nano: 0 },
          close: { units: 6919, nano: 0 },
          volume: 1164,
          time: { seconds: 1729706400, nanos: 0 },
          last_trade_ts: { seconds: 1729706447, nanos: 604517000 },
          instrument_uid: "02cfdf61-6298-4c0f-a9ca-9cabc82afaf3"
        },
        {
          figi: "BBG004731032",
          interval: "SUBSCRIPTION_INTERVAL_ONE_MINUTE",
          open: { units: 6920, nano: 100000000 },
          high: { units: 6923, nano: 200000000 },
          low: { units: 6918, nano: 500000000 },
          close: { units: 6921, nano: 800000000 },
          volume: 1300,
          time: { seconds: 1729706460, nanos: 0 },
          last_trade_ts: { seconds: 1729706510, nanos: 500000000 },
          instrument_uid: "02cfdf61-6298-4c0f-a9ca-9cabc82afaf3"
        },
        {
          figi: "BBG004731032",
          interval: "SUBSCRIPTION_INTERVAL_ONE_MINUTE",
          open: { units: 6923, nano: 300000000 },
          high: { units: 6924, nano: 600000000 },
          low: { units: 6920, nano: 100000000 },
          close: { units: 6922, nano: 400000000 },
          volume: 1500,
          time: { seconds: 1729706520, nanos: 0 },
          last_trade_ts: { seconds: 1729706575, nanos: 400000000 },
          instrument_uid: "02cfdf61-6298-4c0f-a9ca-9cabc82afaf3"
        },
        {
          figi: "BBG004731032",
          interval: "SUBSCRIPTION_INTERVAL_ONE_MINUTE",
          open: { units: 6925, nano: 500000000 },
          high: { units: 6926, nano: 800000000 },
          low: { units: 6922, nano: 300000000 },
          close: { units: 6924, nano: 700000000 },
          volume: 1700,
          time: { seconds: 1729706580, nanos: 0 },
          last_trade_ts: { seconds: 1729706623, nanos: 900000000 },
          instrument_uid: "02cfdf61-6298-4c0f-a9ca-9cabc82afaf3"
        },
        // ... Добавьте еще свечи по аналогии, если необходимо
      ]
    };
  },
};
</script>

<style scoped>
.outer-container {
  width: 100%;
  height: 500px;
  position: relative;
}
</style>
