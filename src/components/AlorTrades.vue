<template>
  <div>
    <h2>Real-time Trade Data</h2>
    <div>Total count trades: {{ totalCountTrades }}</div>

    <!-- All Trades Statistics with Buy/Sell Comparison -->
    <h3>Trade History Statistics (All):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistory"
          :key="'all-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div>{{ Math.floor(trade) }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistory)) * 100}%` }">
          <div class="block">
            <div
                class="buy-bar"
                :style="{ width: `${(tradeHistoryBuy[index] / trade) * 100}%` }"
            ></div>
            <div
                class="sell-bar"
                :style="{ width: `${(tradeHistorySell[index] / trade) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <h3>Trade History Statistics (SBER):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tickerStats['SBER']?.tradeHistory"
          :key="'all-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div>{{ Math.floor(trade) }}</div>
        <div :style="{ width: `${(trade / Math.max(...tickerStats['SBER']?.tradeHistory)) * 100}%` }">
          <div class="block">
            <div
                class="buy-bar"
                :style="{ width: `${(tickerStats['SBER']?.tradeHistoryBuy[index] / trade) * 100}%` }"
            ></div>
            <div
                class="sell-bar"
                :style="{ width: `${(tickerStats['SBER']?.tradeHistorySell[index] / trade) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Trades Statistics -->
    <h3>Trade History Statistics (Buy):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistoryBuy"
          :key="'buy-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div>{{ Math.floor(trade) }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistoryBuy)) * 100}%` }">
          <div class="block" style="background-color: green;"></div>
        </div>
      </div>
    </div>

    <!-- Sell Trades Statistics -->
    <h3>Trade History Statistics (Sell):</h3>
    <div class="container" style="max-width: 200px;">
      <div
          class="row"
          v-for="(trade, index) in tradeHistorySell"
          :key="'sell-' + index"
          style="display: grid; grid-template-columns: 1fr 5fr;"
      >
        <div>{{ Math.floor(trade) }}</div>
        <div :style="{ width: `${(trade / Math.max(...tradeHistorySell)) * 100}%` }">
          <div class="block" style="background-color: red;"></div>
        </div>
      </div>
    </div>



    <div v-if="trades.length">
      <p>Latest Trades Data:</p>
      <ul>
        <li v-for="(trade, index) in reversedTrades.slice(0,100)" :key="index">
          <div :style="{ color: trade.side === 'buy' ? 'green' : 'red' }">
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
      // Ваш исходный код
      //tickers: [...],
      trades: [],
      totalCountTrades: 0,
      tradeHistory: [],
      tradeHistoryBuy: [],
      tradeHistorySell: [],
      intervalCounters: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervalCountersBuy: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervalCountersSell: Array.from({ length: 25 }, () => ({
        count: 0, lastUpdate: null, accumulatedTrades: 0
      })),
      intervals: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216],
      startCountingTime: Date.now(),
      newTradesCount: 0,
      newTradesCountBuy: 0,
      newTradesCountSell: 0,
      staticHistory: false,
      tickerStats: {}  // Новый объект для хранения статистики по каждому тикеру
    };
  },
  computed: {
    reversedTrades() {
      return this.trades.slice().reverse();
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

        if (trade.side === 'buy') {
          this.newTradesCountBuy++;
        } else if (trade.side === 'sell') {
          this.newTradesCountSell++;
        }

        // Создание структуры для нового тикера
        if (!this.tickerStats[trade.ticker] && trade.ticker) {
          this.tickerStats[trade.ticker] = {
            tradeHistory: Array(this.intervals.length).fill(0),
            tradeHistoryBuy: Array(this.intervals.length).fill(0),
            tradeHistorySell: Array(this.intervals.length).fill(0),
            intervalCounters: Array.from({ length: this.intervals.length }, () => ({
              count: 0, lastUpdate: null, accumulatedTrades: 0
            })),
            intervalCountersBuy: Array.from({ length: this.intervals.length }, () => ({
              count: 0, lastUpdate: null, accumulatedTrades: 0
            })),
            intervalCountersSell: Array.from({ length: this.intervals.length }, () => ({
              count: 0, lastUpdate: null, accumulatedTrades: 0
            }))
          };
        }

        // Обновление статистики для тикера
        this.updateTradeHistoryForTicker(trade);

        // Ограничение размера массива trades
        if (this.trades.length > 1000) this.trades.shift();

        // Обновление общей статистики
        this.updateTradeHistory();
      };
    },
    toggleStaticHistory() {
      this.staticHistory = !this.staticHistory;
    },
    updateTradeHistory() {
      const latestTradeTime = Date.now();
      this.calculateIntervalStats(this.tradeHistory, this.intervalCounters, this.newTradesCount, latestTradeTime);
      this.calculateIntervalStats(this.tradeHistoryBuy, this.intervalCountersBuy, this.newTradesCountBuy, latestTradeTime);
      this.calculateIntervalStats(this.tradeHistorySell, this.intervalCountersSell, this.newTradesCountSell, latestTradeTime);

      this.newTradesCount = 0;
      this.newTradesCountBuy = 0;
      this.newTradesCountSell = 0;
    },
    updateTradeHistoryForTicker(trade) {

      if(!trade.ticker) return;

      const latestTradeTime = Date.now();
      const tickerData = this.tickerStats[trade.ticker];

      // Обновление для всех сделок по тикеру
      this.calculateIntervalStats(tickerData.tradeHistory, tickerData.intervalCounters, 1, latestTradeTime);

      // Обновление для buy/sell сделок по тикеру
      if (trade.side === 'buy') {
        this.calculateIntervalStats(tickerData.tradeHistoryBuy, tickerData.intervalCountersBuy, 1, latestTradeTime);
      } else if (trade.side === 'sell') {
        this.calculateIntervalStats(tickerData.tradeHistorySell, tickerData.intervalCountersSell, 1, latestTradeTime);
      }

      // Вывод в консоль для проверки структуры
      //console.log(this.tickerStats);
      //console.log(this.tradeHistory);
    },
    calculateIntervalStats(history, counters, newCount, latestTime) {
      this.intervals.forEach((interval, index) => {
        const intervalMillis = interval * 1000;
        const counter = counters[index];

        if (counter.lastUpdate === null) {
          counter.lastUpdate = this.startCountingTime;
        }

        const elapsedTime = latestTime - counter.lastUpdate;

        if (elapsedTime >= intervalMillis) {
          const intervalTrades = newCount + counter.accumulatedTrades;
          const averageTrades = intervalTrades / interval;

          if (history.length <= index) {
            history.push(averageTrades);
          } else {
            history[index] = averageTrades;
          }

          counter.accumulatedTrades = 0;
          counter.lastUpdate = latestTime;
        } else {
          counter.accumulatedTrades += newCount;
        }
      });
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
  background: #ccc;
}

.buy-bar {
  height: 50%;
  background-color: green;
}

.sell-bar {
  height: 50%;
  background-color: red;
}
</style>
