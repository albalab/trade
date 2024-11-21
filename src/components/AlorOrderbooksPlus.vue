<template>
  <div>
    <AlorOrderbooks
        @update-orderbook="updateOrderbook"
        @update-orderbooks-summary="updateOrderbooksSummary"/>
  </div>
</template>

<script>
import AlorOrderbooks from './AlorOrderbooks.vue';
export default {
  name: 'alor-orderbooks-plus',
  components: {
    AlorOrderbooks,
  },

  data() {
    return {

    };
  },


  computed: {

  },

  methods: {
    updateOrderbook(){
      //console.log(orderbook);
    },
    updateOrderbooksSummary(orderbooksSummary){
      this.$emit('update-orderbooks-summary', orderbooksSummary);
    }
  },

  mounted() {

  },

};
</script>
