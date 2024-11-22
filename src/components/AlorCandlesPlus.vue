<template>
  <div>
    <AlorCandles
        @update-candle="updateCandle"
        @update-candles-counters="updateCandlesCounters"
        @update-candles-summary="updateCandlesSummary"/>
  </div>
</template>

<script>
import AlorCandles from './AlorCandles.vue';
export default {
  name: 'alor-candles-plus',
  components: {
    AlorCandles,
  },

  data() {
    return {

    };
  },


  computed: {

  },

  methods: {
    updateCandle(){
      //console.log(candle);
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
