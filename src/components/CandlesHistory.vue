<template>
  <div>
    <h2>Тест получения исторических свечей</h2>
    <button @click="fetchHistoricalCandles">Получить историю</button>
    <pre v-if="candlesData">{{ JSON.stringify(candlesData, null, 2) }}</pre>
    <p v-else>История еще не загружена</p>
  </div>
</template>

<script>
export default {
  name: 'HistoricalCandlesTest',
  data() {
    return {
      candlesData: null,
    };
  },
  methods: {
    async getHistoricalCandles(exchange, symbol, timeframe, from, to) {
      try {
        const response = await fetch('https://signalfabric.com/get-historical-candles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exchange, symbol, timeframe, from, to  }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Не удалось получить исторические свечи');
        }

        console.log('Полученные исторические свечи:', data.data);
        return data.data;
      } catch (error) {
        console.error('Ошибка при получении истории:', error.message);
        throw error;
      }
    },
    async fetchHistoricalCandles() {
      try {
        const exchange = 'MOEX';
        const symbol = 'SBER';
        const timeframe = 60; // 1 минута
        const from = Math.floor(Date.now() / 1000) - 86600;
        const to = Math.floor(Date.now() / 1000); // Сейчас


        this.candlesData = await this.getHistoricalCandles(exchange, symbol, timeframe, from, to);
      } catch (error) {
        console.error('Ошибка в fetchHistoricalCandles:', error);
        this.candlesData = { error: error.message };
      }
    },
  },
};
</script>

<style scoped>
pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  max-height: 400px;
  overflow-y: auto;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>