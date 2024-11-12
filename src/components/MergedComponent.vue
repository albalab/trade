<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
    <div>
      <AlorTrades/>
    </div>
    <div>
      <AlorOrderbooks/>
    </div>
    <div>
      <AlorCandles/>
    </div>
  </div>
</template>

<script>
import AlorTrades from './AlorTrades.vue';
import AlorOrderbooks from './AlorOrderbooks.vue';
import AlorCandles from './AlorCandles.vue';

export default {
  name: 'MergedComponent',

  components: {
    AlorTrades,
    AlorOrderbooks,
    AlorCandles,
  },

  data() {
    return {

    }
  },

}
</script>

<style scoped>

</style>
