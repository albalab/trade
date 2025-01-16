<template>
  <div class="orders-table">
    <h2>Ордера / Сделки</h2>
    <table>
      <thead>
      <tr>
        <th>Buy Orders</th>
        <th>Sell Orders</th>
        <th>Open Trades</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>
          <div v-for="bo in buyOrders" :key="bo.price">
            @{{ bo.price.toFixed(2) }} x {{ bo.volume }}
          </div>
        </td>
        <td>
          <div v-for="so in sellOrders" :key="so.price">
            @{{ so.price.toFixed(2) }} x {{ so.volume }}
          </div>
        </td>
        <td>
          <div v-for="(ot, idx) in openTrades" :key="idx">
            BUY@{{ ot.buyPrice.toFixed(2) }}, TP@{{ ot.takeProfit.toFixed(2) }},
            vol={{ ot.volume }}
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "OrdersTable",
  props: {
    buyOrders: {
      type: Array,
      required: true,
    },
    sellOrders: {
      type: Array,
      required: true,
    },
    openTrades: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.orders-table {
  padding: 20px;
  background-color: #242737;
  border: 1px solid #404562;
  margin-top: 10px;
}

.orders-table table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 8px;
  text-align: left;
  border: 1px solid #404562;
}

.orders-table th {
  background-color: #333;
  color: white;
}

.orders-table td div {
  margin-bottom: 4px;
}
</style>
