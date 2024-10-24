<template>
  <div>
    <h2>Real-time Trade Data</h2>
    <div v-if="trades.length">
      <p>Latest Trades Data:</p>
      <ul>
        <li v-for="(trade, index) in reversedTrades" :key="index">
          <strong>Ticker: {{ trade.ticker }}</strong>,
          Trade {{ index + 1 }}:
          Price: {{ trade.price }},
          Side: {{ trade.side }},
          Quantity: {{ trade.qty }},
          Time: {{ new Date(trade.time).toLocaleString() }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No trade data received yet.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TradeData',
  data() {
    return {
      trades: [], // Массив для хранения данных о сделках
    };
  },
  computed: {
    reversedTrades() {
      return this.trades.slice().reverse(); // Переворачиваем массив для отображения актуальных данных сверху
    }
  },
  mounted() {
    this.connectToWebSocket();
  },
  methods: {
    connectToWebSocket() {
      const socket = new WebSocket('ws://localhost:4444'); // Соединение с сервером

      // Обработка сообщений от WebSocket сервера
      socket.onmessage = (event) => {
        const trade = JSON.parse(event.data); // Парсинг данных
        //console.log('Получены данные с сервера:', trade); // Проверка, приходят ли данные на фронт

        // Добавляем полученные данные без лишних проверок
        this.trades.push(trade);

        // Сохраняем только последние 100 сделок для оптимизации
        if (this.trades.length > 100) {
          this.trades.shift();
        }
      };

      socket.onopen = () => {
        console.log('Соединение с WebSocket установлено');
      };

      socket.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
      };

      socket.onclose = () => {
        console.log('Соединение WebSocket закрыто');
      };
    }
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
li {
  margin-bottom: 10px;
}
</style>
