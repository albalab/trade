<template>
  <div>
    <AlorCandles
        @update-candle="updateCandle"
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
    updateCandlesSummary(candlesSummary){
      this.$emit('update-candles-summary', candlesSummary);
    }
  },

  mounted() {

  },

};
</script>
