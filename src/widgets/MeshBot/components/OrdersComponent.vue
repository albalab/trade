<template>
  <div class="orders">
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
          <div v-for="bo in buyLevels" :key="bo.price">
            @{{ bo.price.toFixed(2) }} x {{ bo.volume }}
          </div>
        </td>
        <td>
          <div v-for="so in sellOrders" :key="so.price">
            @{{ so.price.toFixed(2) }} x {{ so.volume }}
          </div>
        </td>
        <td>
          <div v-for="ot in openTrades" :key="ot.buyPrice">
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
  props: {
    buyLevels: Array,
    sellOrders: Array,
    openTrades: Array,
  },
};
</script>
