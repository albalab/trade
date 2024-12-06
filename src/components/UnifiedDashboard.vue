<template>
  <div class="panels-container">

    <!-- Отображение агрегированных данных по тикерам -->
    <div style="overflow: auto; height: 500px;">
      <div class="table table-trade">
        <div class="table-row">
          <div class="table-cell">Ticker</div>
          <div class="table-cell" v-for="item in getFields(summaryData)" :key="item">
            {{item}}
          </div>
        </div>
        <div class="table-row" v-for="(item, key) in summaryData" :key="key">
          <div class="table-cell">{{key}}</div>
          <div class="table-cell" v-for="(value, innerKey) in item" :key="innerKey">
            <span v-if="innerKey === 'spread'">{{parseFloat(value).toFixed(3)}}</span>
            <span v-else>{{value}}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Сигналы -->
    <div style="height: 200px; overflow: auto;">
      <div v-for="(signal, idx) in signals" :key="idx">
        {{signal}}
      </div>
    </div>

    <div class="panels-grid">

      <!-- Панель с сигналами, частотами и выгодными сделками -->
      <div class="panel" style="height: 600px; overflow: auto;">
        <h2>Signals</h2>
        <StatisticRenderer :items="convertFrequencyToArray(buyFrequency)" title="Buy Frequency"/>
        <StatisticRenderer :items="convertFrequencyToArray(sellFrequency)" title="Sell Frequency"/>

        <div style="margin-bottom: 10px;">
          <label>
            <input type="checkbox" v-model="isSaveEnabled" />
            Включить сохранение в базу данных
          </label>
        </div>

        <div style="margin: 0 0 5px;">
          <input type="text" v-model="profitPercent"/>
        </div>

        <!-- Выгодные сделки (Покупки) -->
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.tradesStatistics?.advantageousBuyDifferences)"
            title="Выгодные сделки (Покупки)"
        />

        <!-- Выгодные сделки (Продажи) -->
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.tradesStatistics?.advantageousSellDifferences)"
            title="Выгодные сделки (Продажи)"
        />
      </div>

      <!-- Trades -->
      <div class="panel">
        <h2>Trades</h2>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.tradesCounters?.tradesCounters)"
            title="Trades Counters"/>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.tradesCounters?.tradesStats)"
            title="Trades Stats"/>
      </div>

      <!-- Orderbooks -->
      <div class="panel">
        <h2>Orderbooks</h2>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.orderbooksCounters?.orderbooksCounters)"
            title="Orderbooks Counters"/>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.orderbooksCounters?.orderbooksStats)"
            title="Orderbooks Stats"/>
      </div>

      <!-- Candles -->
      <div class="panel">
        <h2>Candles</h2>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.candlesCounters?.candlesCounters)"
            title="Candles Counters"/>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.candlesCounters?.candlesStats)"
            title="Candles Stats"/>
      </div>

      <!-- Quotes -->
      <div class="panel">
        <h2>Quotes</h2>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.quotesCounters?.quotesCounters)"
            title="Quotes Counters"/>
        <StatisticRenderer
            :items="convertObjectToArray(globalData?.quotesCounters?.quotesStats)"
            title="Quotes Stats"/>
      </div>
    </div>

    <div style="padding: 10px;">
      <input v-model="priceOrder" placeholder="price"><br>
      <input v-model="tickerOrder" placeholder="ticker"><br>
      <input v-model="sideOrder" placeholder="side"><br>
      <button @click="sendLimitOrder(1, priceOrder, tickerOrder, 'MOEX', sideOrder, 'D88141')">
        Отправить лимитный ордер
      </button>
    </div>

    <input type="text" v-model="selectedTicker"/><br>
    <div style="padding: 10px;">
      <div v-for="(item, key) in summaryData[selectedTicker]" :key="key">
        {{key}}: {{item}}
      </div>
    </div>

  </div>
</template>

<script>
import { sendLimitOrder as importedSendLimitOrder } from '../modules/LimitOrderModule.js';
import StatisticRenderer from "@/components/StatisticRenderer.vue";
//import LevelsRenderer from "@/components/LevelsRenderer.vue"; // Если нужен для чего-то аналогично StatisticRenderer

export default {
  name: 'UnifiedDashboard',
  components: {
    StatisticRenderer,
    //LevelsRenderer
  },
  data() {
    return {
      inProgress: false,
      isSaveEnabled: false,
      profitPercent: 0.2,
      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',
      globalData: {},
      selectedTicker: 'SBER',
      summaryData: {},
      lastSaveTime: {},
      summaryDataHistory: [],
      globalDataHistory: [],
      historyLimit: 20,
      signals: [],
      fields: [
        "trades.tradeSide",
        "trades.tradePrice"
      ],
      socket: null
    }
  },

  computed: {
    buyFrequency() {
      const frequency = this.signals
          .filter(signal => signal.action === "buy" && signal.ticker)
          .reduce((acc, signal) => {
            acc[signal.ticker] = (acc[signal.ticker] || 0) + 1;
            return acc;
          }, {});
      return Object.fromEntries(
          Object.entries(frequency).sort(([, a], [, b]) => b - a)
      );
    },
    sellFrequency() {
      const frequency = this.signals
          .filter(signal => signal.action === "sell" && signal.ticker)
          .reduce((acc, signal) => {
            acc[signal.ticker] = (acc[signal.ticker] || 0) + 1;
            return acc;
          }, {});
      return Object.fromEntries(
          Object.entries(frequency).sort(([, a], [, b]) => b - a)
      );
    },
  },

  methods: {
    getFields(summaryData){
      if(!summaryData) return;
      const firstTicker = Object.keys(summaryData)[0];
      if(!firstTicker) return;
      return Object.keys(summaryData[firstTicker]);
    },

    addSignal(signal) {
      const signals = [...this.signals.reverse()];
      signals.push(signal);
      if (signals.length > 500) {
        signals.shift();
      }
      this.signals = signals.reverse();
    },

    // Ниже идут стратегии, взятые из исходного кода:
    imbalanceStrategy(tickerData) {
      if (tickerData.orderbookVolumeImbalance > 1000) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.orderbookBestAskPrice,
          reason: "Volume Imbalance > 1000",
        });
      } else if (tickerData.orderbookVolumeImbalance < -1000) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.orderbookBestBidPrice,
          reason: "Volume Imbalance < -1000",
        });
      }
    },
    breakoutStrategy(tickerData) {
      if (tickerData.tradePrice > tickerData.candleHigh) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Breakout above candle high",
        });
      } else if (tickerData.tradePrice < tickerData.candleLow) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Breakout below candle low",
        });
      }
    },
    spreadScalpingStrategy(tickerData) {
      if (tickerData.orderbookSpread < 0.01) {
        const action = tickerData.tradeSide === "buy" ? "buy" : "sell";
        const price =
            action === "buy"
                ? tickerData.orderbookBestAskPrice
                : tickerData.orderbookBestBidPrice;
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price,
          reason: "Tight spread with " + action + " side dominance",
        });
      }
    },
    candlePatternStrategy(tickerData) {
      if (tickerData.candleLowerShadow > 2 * (tickerData.candleRange - tickerData.candleBodySize)) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Bullish candle pattern",
        });
      } else if (tickerData.candleUpperShadow > 2 * (tickerData.candleRange - tickerData.candleBodySize)) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Bearish candle pattern",
        });
      }
    },
    volumeImbalanceStrategy(tickerData) {
      if (tickerData.orderbookTotalBidVolume > tickerData.orderbookTotalAskVolume * 1.5) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.orderbookBestAskPrice,
          reason: "Strong bid volume imbalance",
        });
      } else if (tickerData.orderbookTotalAskVolume > tickerData.orderbookTotalBidVolume * 1.5) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.orderbookBestBidPrice,
          reason: "Strong ask volume imbalance",
        });
      }
    },
    narrowSpreadStrategy(tickerData) {
      if (tickerData.orderbookSpread < 0.01) {
        const action = tickerData.tradeTickerFrequencyBuy > tickerData.tradeTickerFrequencySell
            ? "buy"
            : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price:
              action === "buy"
                  ? tickerData.orderbookBestAskPrice
                  : tickerData.orderbookBestBidPrice,
          reason: "Narrow spread with " + action + " dominance",
        });
      }
    },
    candleVolumeStrategy(tickerData, avgVolume) {
      if (tickerData.candleVolume > avgVolume * 1.5) {
        const action = tickerData.candleDirection === "up" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "High candle volume with direction " + tickerData.candleDirection,
        });
      }
    },
    smallBodyBreakoutStrategy(tickerData) {
      if (tickerData.candleBodySize < tickerData.candleRange * 0.1) {
        const action =
            tickerData.tradePrice > tickerData.candleHigh ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "Small body, possible breakout",
        });
      }
    },
    shadowStrategy(tickerData) {
      if (tickerData.candleLowerShadow > tickerData.candleUpperShadow * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Long lower shadow, reversal up",
        });
      } else if (tickerData.candleUpperShadow > tickerData.candleLowerShadow * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Long upper shadow, reversal down",
        });
      }
    },
    tradeCostSpikeStrategy(tickerData) {
      if (tickerData.tradeVolumeAbsoluteRub > 1000000) {
        const action = tickerData.tradeSide === "buy" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          cost: tickerData.tradeVolumeAbsoluteRub,
          reason: "Trade cost spike, action: " + action,
        });
      }
    },
    candleRangeStrategy(tickerData, avgRange) {
      if (tickerData.candleRange > avgRange * 1.5) {
        const action = tickerData.candleDirection === "up" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "Large candle range, direction: " + tickerData.candleDirection,
        });
      }
    },
    averagePriceImbalanceStrategy(tickerData) {
      if (tickerData.tradePrice > tickerData.orderbookAverageAskPrice) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Price above average ask price",
        });
      } else if (tickerData.tradePrice < tickerData.orderbookAverageBidPrice) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Price below average bid price",
        });
      }
    },
    candleStrengthStrategy(tickerData) {
      if (tickerData.candleStrength > 0) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Candle strength positive",
        });
      } else if (tickerData.candleStrength < 0) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Candle strength negative",
        });
      }
    },
    lastVolumeStrategy(tickerData) {
      if (tickerData.tradeLastBuyVolume > tickerData.tradeLastSellVolume * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Last buy volume dominant",
        });
      } else if (tickerData.tradeLastSellVolume > tickerData.tradeLastBuyVolume * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Last sell volume dominant",
        });
      }
    },

    executeStrategies(data) {
      const avgVolume = 5000;
      const avgRange = 0.1;
      Object.keys(data).forEach((ticker) => {
        const tickerData = data[ticker];
        if(!tickerData.tradeTicker) return;

        this.imbalanceStrategy(tickerData);
        this.breakoutStrategy(tickerData);
        this.spreadScalpingStrategy(tickerData);
        this.candlePatternStrategy(tickerData);
        this.volumeImbalanceStrategy(tickerData);
        this.narrowSpreadStrategy(tickerData);
        this.candleVolumeStrategy(tickerData, avgVolume);
        this.smallBodyBreakoutStrategy(tickerData);
        this.shadowStrategy(tickerData);
        this.tradeCostSpikeStrategy(tickerData);
        this.candleRangeStrategy(tickerData, avgRange);
        this.averagePriceImbalanceStrategy(tickerData);
        this.candleStrengthStrategy(tickerData);
        this.lastVolumeStrategy(tickerData);
      });
    },

    processAdvantageousDifferences(differences, type) {
      if (!differences || Object.keys(differences).length === 0) {
        return;
      }

      this.lastSaveTime = this.lastSaveTime || {};
      const now = Date.now();
      const saveInterval = 60000;
      const tickersToSave = {};

      for (const [ticker, data] of Object.entries(differences)) {
        if (this.lastSaveTime[ticker] && now - this.lastSaveTime[ticker] < saveInterval) {
          continue;
        }
        tickersToSave[ticker] = data;
        this.lastSaveTime[ticker] = now;
      }

      if (Object.keys(tickersToSave).length === 0) return;

      for (const [ticker, data] of Object.entries(tickersToSave)) {
        const dealData = {
          ticker,
          type,
          ...data,
          saveTime: new Date().toISOString()
        };
        this.sendBestDeal(dealData);
      }
    },

    async sendBestDeal(dealData) {
      if (!this.isSaveEnabled) {
        return;
      }

      try {
        const data = {
          dealData,
          summaryDataHistory: this.summaryDataHistory,
          globalDataHistory: this.globalDataHistory
        };

        const response = await fetch('http://localhost:8080/best-deals/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to save deal and history:', error.message);
          return;
        }

        const result = await response.json();
        console.log('Deal and history saved successfully:', result);
      } catch (err) {
        console.error('Error sending deal and history:', err);
      }
    },

    updateSummaryData() {
      const data = { ...this.globalData };
      const result = { ...this.summaryData };

      // Оставляем только аггрегированные данные с тикерами
      const tickerSections = ['trades'];
      for (const section in data) {
        if (!tickerSections.includes(section)) continue;
        for (const ticker in data[section]) {
          if (!result[ticker]) result[ticker] = {};
          Object.assign(result[ticker], data[section][ticker]);
        }
      }
      this.summaryData = result;
    },

    sendLimitOrder: importedSendLimitOrder,

    selectTicker(ticker){
      this.selectedTicker = ticker;
      window.parent.postMessage({ 'selectTicker': ticker }, "*");
    },

    // Конвертация частотного объекта в массив для StatisticRenderer
    convertFrequencyToArray(freqObj) {
      return Object.entries(freqObj).map(([ticker, count]) => ({ ticker, count }));
    },
    // Конвертация объекта в массив для StatisticRenderer
    convertObjectToArray(obj) {
      if(!obj) return [];
      return Object.entries(obj).map(([key, value]) => ({ key, value }));
    },

    connectToWebSocket() {
      this.socket = new WebSocket('wss://signalfabric.com/datastream/');
      this.socket.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);

          console.log(data);

          if (data && data.data) {
            // Мерджим пришедшие данные в globalData
            if (data && data.data) {
              this.globalData = {
                ...this.globalData,
                ...data.data
              };
            } else {
              // Если data.data нет, попробуем смёрджить сам data
              this.globalData = {
                ...this.globalData,
                ...data
              };
            }
          }
        } catch(e) {
          console.error('JSON parse error', e);
          return;
        }

        // Предполагаем, что бекенд выдает готовые агрегаты
        // например:
        // data = {
        //   tradesCounters: {...},
        //   orderbooksCounters: {...},
        //   candlesCounters: {...},
        //   quotesCounters: {...},
        //   tradesStatistics: {...}
        // }

        /*this.globalData = {
          tradesStatistics: data.tradesStatistics || {},
          tradesCounters: data.tradesCounters || {},
          orderbooksCounters: data.orderbooksCounters || {},
          candlesCounters: data.candlesCounters || {},
          quotesCounters: data.quotesCounters || {}
        };*/
      };
    }
  },

  watch: {
    'globalData.tradesStatistics.advantageousBuyDifferences': {
      immediate: true,
      handler(newData) {
        this.processAdvantageousDifferences(newData, 'Buy');
      }
    },
    'globalData.tradesStatistics.advantageousSellDifferences': {
      immediate: true,
      handler(newData) {
        this.processAdvantageousDifferences(newData, 'Sell');
      }
    },

    summaryData: {
      deep: true,
      immediate: true,
      handler(newData) {
        if (!newData || Object.keys(newData).length === 0) return;

        const snapshot = {
          ...newData,
          timestamp: new Date().toISOString()
        };
        this.executeStrategies(newData);

        if(this.isSaveEnabled){
          this.summaryDataHistory.push(snapshot);
          if (this.summaryDataHistory.length > this.historyLimit) {
            this.summaryDataHistory.shift();
          }
        } else {
          this.summaryDataHistory = [];
        }
      }
    },

    globalData: {
      deep: true,
      immediate: true,
      handler(newData) {
        if (!newData || Object.keys(newData).length === 0) return;
        if(this.inProgress) return;
        this.inProgress = true;
        setTimeout(()=>{
          this.inProgress = false;
        }, 500);

        this.updateSummaryData();

        const snapshot = {
          tradesStatistics: newData.tradesStatistics || {},
          tradesCounters: newData.tradesCounters || {},
          orderbooksCounters: newData.orderbooksCounters || {},
          candlesCounters: newData.candlesCounters || {},
          quotesCounters: newData.quotesCounters || {},
          timestamp: new Date().toISOString()
        };

        if(this.isSaveEnabled){
          this.globalDataHistory.push(snapshot);
          if (this.globalDataHistory.length > this.historyLimit) {
            this.globalDataHistory.shift();
          }
        } else {
          this.globalDataHistory = [];
        }
      }
    }
  },

  mounted() {
    this.connectToWebSocket();
  }
}
</script>

<style>
.table-trade .table-cell {
  white-space: nowrap;
}

.table {
  display: table;
}
.table-row {
  display: table-row;
}
.table-cell {
  display: table-cell;
}

.panels-container {
  padding: 20px;
  background: #e5e5e5;
}
.panels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}
.panel {
  margin: 4px;
  padding: 10px;
  border: solid 1px #ccc;
  border-radius: 6px;
  background: white;
}
</style>
