<template>
  <div>
    <AlorCandles
        @update-trade="updateCandle"
        @update-trades-summary="updateCandlesSummary"/>
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
    updateCandles(){
      //console.log(candle);
    },
    updateCandlesSummary(candlesSummary){
      this.$emit('update-candles-summary', candlesSummary);
    }
  },

  mounted() {

  },

};
</script>
