<template>
  <div style="border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
    <h3>{{ title }}</h3>
    <div v-for="(item, ticker) in deals" :key="ticker">
      <span class="select-ticker" @click="$emit('select-ticker', ticker)">
        {{ ticker }}
      </span>:
      <span>
        {{ item.percentage }}% ({{ operation }}: {{ item.buyPrice || item.buyPrice }} → {{ item.sellPrice || item.sellPrice }})
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdvantageousDeals',
  props: {
    title: {
      type: String,
      required: true,
    },
    deals: {
      type: Object,
      required: true,
    },
    operation: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.select-ticker {
  cursor: pointer;
  color: #007bff;
}
.select-ticker:hover {
  text-decoration: underline;
}
</style>
