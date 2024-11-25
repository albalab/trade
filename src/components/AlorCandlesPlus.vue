<template>
  <div>
    <StatisticAggregator v-if="currentCandles" :items="currentCandles" type="candles"/>
    <AlorCandles
        @update-candles="updateCandles"
        @update-candles-counters="updateCandlesCounters"
        @update-candles-summary="updateCandlesSummary"/>
  </div>
</template>

<script>
import AlorCandles from './AlorCandles.vue';
import StatisticAggregator from "@/components/StatisticAggregator.vue";
export default {
  name: 'alor-candles-plus',
  components: {
    StatisticAggregator,
    AlorCandles,
  },

  data() {
    return {
      currentCandles: [],
    };
  },


  computed: {

  },

  methods: {
    updateCandles(candles){
      this.currentCandles = candles;
    },
    updateCandlesCounters(candlesCounters){
      this.$emit('update-candles-counters', candlesCounters);
    },
    updateCandlesSummary(candlesSummary){
      this.$emit('update-candles-summary', candlesSummary);
    }
  },

  mounted() {

  },

};
</script>
