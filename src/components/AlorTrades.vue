<template>
  <div>
    <h2>Real-time Trade Data</h2>
    Total count trades: {{ totalCountTrades }}<br />
    <h3>Trade History Statistics (Log):</h3>

    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistory"
          :key="index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div>{{ Math.floor(trade) }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistory)) * 100}%` }">
          <div class="block"></div>
        </div>
      </div>
    </div>

    <div v-if="trades.length">
      <p>Latest Trades Data:</p>
      <ul>
        <li v-for="(trade, index) in reversedTrades.slice(0,100)" :key="index">
          <div
              :style="{ color: trade.side === 'buy' ? 'green' : 'red' }"
          >
            <strong>Ticker: {{ trade.ticker }}</strong> Price: {{ trade.price }},
            Side: {{ trade.side }}, Quantity: {{ trade.qty }},
            Time: {{ new Date(trade.time).toLocaleString() }}
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No trade data received yet.</p>
    </div>

    <button @click="toggleStaticHistory">Toggle Static History</button>
  </div>
</template>

<script>
export default {
  name: 'TradeData',
  data() {
    return {
      trades: [],
      totalCountTrades: 0,
      tradeHistory: [],
      intervalCounters: Array.from({ length: 25 }, () => ({ count: 0, lastUpdate: null, accumulatedTrades: 0 })),
      intervals: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216],
      startCountingTime: Date.now(), // Инициализируем текущим временем
      newTradesCount: 0,
      staticHistory: false
    };
  },
  computed: {
    reversedTrades() {
      return this.trades.slice().reverse();
    },
    tradesLastSecond() {
      const oneSecondAgo = Date.now() - 1000;
      return this.trades.filter(trade => trade.time >= oneSecondAgo).length;
    }
  },
  mounted() {
    this.connectToWebSocket();
  },
  methods: {
    connectToWebSocket() {
      const socket = new WebSocket('ws://localhost:4444');
      socket.onmessage = (event) => {
        const trade = JSON.parse(event.data);
        this.trades.push(trade);
        this.totalCountTrades++;
        this.newTradesCount++;

        if (this.trades.length > 1000) this.trades.shift();

        this.updateTradeHistory();
      };
      socket.onopen = () => console.log('Connected to WebSocket');
      socket.onerror = (error) => console.error('WebSocket Error:', error);
      socket.onclose = () => console.log('WebSocket Disconnected');
    },
    toggleStaticHistory() {
      this.staticHistory = !this.staticHistory;
    },
    updateTradeHistory() {
      const latestTradeTime = Date.now();

      this.intervals.forEach((interval, index) => {
        const intervalMillis = interval * 1000;
        const counter = this.intervalCounters[index];

        if (counter.lastUpdate === null) {
          counter.lastUpdate = this.startCountingTime;
        }

        const elapsedTime = latestTradeTime - counter.lastUpdate;

        if (elapsedTime >= intervalMillis) {
          const intervalTrades = this.newTradesCount + counter.accumulatedTrades;
          const averageTrades = intervalTrades / interval;

          if (this.tradeHistory.length <= index) {
            this.tradeHistory.push(averageTrades);
          } else {
            this.tradeHistory[index] = averageTrades;
          }

          counter.accumulatedTrades = 0;
          counter.lastUpdate = latestTradeTime;
        } else {
          counter.accumulatedTrades += this.newTradesCount;
        }
      });
      this.newTradesCount = 0;
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

.container {
  position: relative;
}

.row {
  margin: 0 0 2px;
  display: grid;
}

.block {
  height: 10px;
  background-color: blue;
}
</style>
