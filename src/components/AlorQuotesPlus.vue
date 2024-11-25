<template>
<div>
  <StatisticAggregator v-if="currentQuotes" :items="currentQuotes"  type="quotes"/>
    <AlorQuotes
        @update-quotes="updateQuotes"
        @update-quotes-counters="updateQuotesCounters"
        @update-quotes-summary="updateQuotesSummary"/>
  </div>
</template>

<script>
import AlorQuotes from './AlorQuotes.vue';
import StatisticAggregator from "@/components/StatisticAggregator.vue";
export default {
  name: 'alor-quotes-plus',
  components: {
    StatisticAggregator,
    AlorQuotes,
  },

  data() {
    return {
      currentQuotes: null,
    };
  },


  computed: {

  },

  methods: {
    updateQuotes(quotes){
      this.currentQuotes = quotes;
    },
    updateQuotesCounters(quotesCounters){
      this.$emit('update-quotes-counters', quotesCounters);
    },
    updateQuotesSummary(quotesSummary){
      this.$emit('update-quotes-summary', quotesSummary);
    }
  },

  mounted() {

  },

};
</script>
