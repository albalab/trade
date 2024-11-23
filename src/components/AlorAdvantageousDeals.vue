<template>
  <div style="border: solid 1px #ccc; padding: 10px; margin: 0 0 10px;">
    <h3>{{ title }}</h3>
    <div class="grid-items">
      <div class="item-row" v-for="(item, ticker) in deals" :key="ticker" >
        <span class="item-cell select-ticker" @click="$emit('select-ticker', ticker)">
          {{ ticker }}
        </span>

        <span>{{ item.percentage }}%</span>

        <span class="item-cell item-start-price">
          <span v-if="item.side==='up'">{{ item.buyPrice }}</span>
          <span v-else>{{item.sellPrice}}</span>
        </span>
        <span>→</span>
        <span class="item-cell">
          <span v-if="item.side==='down'">{{ item.buyPrice }}</span>
          <span v-else>{{item.sellPrice}}</span>
        </span>
      </div>
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
      default: () => ({})
    },
    operation: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.grid-items{
  width: 100%;
  display: table;
  white-space: nowrap;
}
.item-row{
  display: table-row;
}
.item-cell{
  display: table-cell;
  padding: 0 4px;
}
.item-cell:first-child{
  width: 50px;
}
.item-start-price{
  text-align: right;
  padding-right: 8px;
}
.select-ticker {
  cursor: pointer;
  color: #007bff;
}
.select-ticker:hover {
  text-decoration: underline;
}
</style>
