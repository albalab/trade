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
      candlesticks: [],
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
      if (event.data && event.data.type === 'candlestick') {
        this.handleCandlestick(event.data.data);
      }
    },
    handleCandlestick(candlestick) {
      if (this.candlesticks.length > 50) {
        this.candlesticks.shift();
      }
      this.candlesticks.push(candlestick);
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
</style>
