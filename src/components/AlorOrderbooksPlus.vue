<template>
  <div>
    <StatisticAggregator v-if="currentOrderbooks" :items="currentOrderbooks"  type="orderbooks"/>
    <AlorOrderbooks
        @update-orderbooks="updateOrderbooks"
        @update-orderbooks-counters="updateOrderbooksCounters"
        @update-orderbooks-summary="updateOrderbooksSummary"/>
  </div>
</template>

<script>
import AlorOrderbooks from './AlorOrderbooks.vue';
import StatisticAggregator from "@/components/StatisticAggregator.vue";
export default {
  name: 'alor-orderbooks-plus',
  components: {
    StatisticAggregator,
    AlorOrderbooks,
  },

  data() {
    return {
      currentOrderbooks: null,
    };
  },


  computed: {

  },

  methods: {
    updateOrderbooks(orderbooks){
      this.currentOrderbooks = orderbooks;
    },
    updateOrderbooksCounters(orderbooksCounters){
      this.$emit('update-orderbooks-counters', orderbooksCounters);
    },
    updateOrderbooksSummary(orderbooksSummary){
      this.$emit('update-orderbooks-summary', orderbooksSummary);
    }
  },

  mounted() {

  },

};
</script>
