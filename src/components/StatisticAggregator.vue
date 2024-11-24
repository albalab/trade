<template>
  <div>
    <h3>Statistic Aggregator</h3>
    counter: {{counter}}<br>
    {{items}}<br>
  </div>
</template>

<script>
export default {
  name: 'statistic-aggregator',

  props: {
    items: Array,
  },

  data(){
    return {
      counter: 0,
    }
  },

  watch: {
    items(newItems) {
      if (Array.isArray(newItems)) {
        this.counter += newItems.length;
      }
    },
  },
}
</script>