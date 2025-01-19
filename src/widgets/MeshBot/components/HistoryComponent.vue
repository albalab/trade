<template>
  <div class="history-container">

    <div style="padding: 10px 8px;">
        <strong>Суммарная прибыль:</strong> {{ totalProfit.toFixed(2) }}
    </div>

    <div class="history">
      <table>
        <thead>
        <tr>
          <th>Buy Price</th>
          <th>Sell Price</th>
          <th>Volume</th>
          <th>Profit</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(trade, index) in closedTradesReversed" :key="index">
          <td>{{ trade.buyPrice.toFixed(2) }}</td>
          <td>{{ trade.sellPrice.toFixed(2) }}</td>
          <td>{{ trade.volume }}</td>
          <td>{{ trade.profit.toFixed(2) }}</td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
export default {
  name: "HistoryComponent",
  props: {
    closedTrades: {
      type: Array,
      required: true,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
  },

  computed: {
    closedTradesReversed() {
      const closedTrades = [];
      //console.log(typeof this.closedTrades);

      this.closedTrades.forEach( item => {
        closedTrades.unshift(item);
      });

      return closedTrades;
    }
  }
};
</script>
