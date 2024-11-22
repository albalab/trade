<template>
<div>
    <AlorQuotes
        @update-quote="updateQuote"
        @update-quotes-counters="updateQuotesCounters"
        @update-quotes-summary="updateQuotesSummary"/>
  </div>
</template>

<script>
import AlorQuotes from './AlorQuotes.vue';
export default {
  name: 'alor-quotes-plus',
  components: {
    AlorQuotes,
  },

  data() {
    return {

    };
  },


  computed: {

  },

  methods: {
    updateQuote(){
      //console.log(quote);
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
