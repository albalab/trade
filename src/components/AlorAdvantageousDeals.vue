<template>
  <div class="adv">
    <h3>{{ title }}</h3>
    <div class="grid-items">
      <div class="item-row" v-for="(item, ticker) in deals" :key="ticker" >
        <span class="item-cell select-ticker"
              @click="$emit('select-ticker', ticker)">
          {{ ticker }}
        </span>

        <span>{{ item.percentage }}%</span>

        <span class="item-cell item-price">
          <span v-if="item.side==='up'">{{ item.buyPrice }}</span>
          <span v-else>{{item.sellPrice}}</span>
        </span>
        <span>→</span>
        <span class="item-cell item-price">
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
  text-align: left;
}
.item-row{
  display: table-row;
}
.item-cell{
  display: table-cell;
  padding: 0 4px;
  width: 25%;
}
.item-cell:first-child{
  width: 50px;
}
.item-price{
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  padding-right: 8px;
  display: inline-block;
  width: 30px;
}
.item-start-price{

}
.item-end-price{

}
.select-ticker {
  cursor: pointer;
  color: #0078D4;
}
.select-ticker:hover {
  text-decoration: underline;
}
.adv{
  border: solid 1px rgba(255,255,255,0.1);
  padding: 10px;
  margin: 0 0 10px;
}
</style>
