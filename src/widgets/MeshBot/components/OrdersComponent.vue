<template>
  <div class="orders">
    <div class="orders-container">

      <!-- Buy Orders Table -->
      <div class="table-block">
        <h3>Buy Orders</h3>
        <table>
          <thead>
          <tr>
            <th>Price</th>
            <th>Volume</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="index in minRows" :key="'buy-' + index">
            <td>{{ buyLevels[index - 1]?.price?.toFixed(2) || '' }}</td>
            <td>{{ buyLevels[index - 1]?.volume || '' }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Sell Orders Table -->
      <div class="table-block">
        <h3>Sell Orders</h3>
        <table>
          <thead>
          <tr>
            <th>Price</th>
            <th>Volume</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="index in minRows" :key="'sell-' + index">
            <td>{{ profitLevels[index - 1]?.price?.toFixed(2) || '' }}</td>
            <td>{{ profitLevels[index - 1]?.volume || '' }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Open Trades Table -->
      <div class="table-block">
        <h3>Open Trades</h3>
        <table>
          <thead>
          <tr>
            <th>Buy Price</th>
            <th>Take Profit</th>
            <th>Volume</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="index in minRows" :key="'open-' + index">
            <td>{{ openTrades[index - 1]?.buyPrice?.toFixed(2) || '' }}</td>
            <td>{{ openTrades[index - 1]?.takeProfit?.toFixed(2) || '' }}</td>
            <td>{{ openTrades[index - 1]?.volume || '' }}</td>
          </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props: {
    buyLevels: Array,
    profitLevels: Array,
    openTrades: Array,
  },
  computed: {
    // Вычисляем минимальное количество строк для отображения
    minRows() {
      const maxRows = Math.max(
          this.buyLevels.length,
          this.profitLevels.length,
          this.openTrades.length
      );
      return Math.max(maxRows, 5); // Минимум 5 строк
    },
  },
};
</script>
