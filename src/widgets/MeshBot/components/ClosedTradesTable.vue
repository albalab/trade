<template>
  <div class="closed-trades-table">
    <h2>Закрытые сделки</h2>
    <table>
      <thead>
      <tr>
        <th>BuyPrice</th>
        <th>SellPrice</th>
        <th>Volume</th>
        <th>Profit</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(trade, index) in closedTrades" :key="index">
        <td>{{ trade.buyPrice.toFixed(2) }}</td>
        <td>{{ trade.sellPrice.toFixed(2) }}</td>
        <td>{{ trade.volume }}</td>
        <td>{{ trade.profit.toFixed(2) }}</td>
      </tr>
      </tbody>
    </table>
    <strong>Суммарная прибыль:</strong> {{ totalProfit.toFixed(2) }}
  </div>
</template>

<script>
export default {
  name: "ClosedTradesTable",
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
};
</script>

<style scoped>
.closed-trades-table {
  padding: 20px;
  background-color: #242737;
  border: 1px solid #404562;
  margin-top: 10px;
}

.closed-trades-table table {
  width: 100%;
  border-collapse: collapse;
}

.closed-trades-table th,
.closed-trades-table td {
  padding: 8px;
  text-align: left;
  border: 1px solid #404562;
}

.closed-trades-table th {
  background-color: #333;
  color: white;
}

.closed-trades-table td {
  color: #ddd;
}
</style>
