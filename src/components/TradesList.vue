<template>
  <div class="trades-list">

    <!-- Кнопка для переключения между режимами -->
    <div class="toggle-mode">
      <button @click="toggleDataMode">
        {{ useFakeData ? 'Switch to Real Trades' : 'Switch to Fake Data' }}
      </button>
    </div>

    <!-- Поле ввода тикера -->
    <div id="ticker-input-container">
      <input
          id="ticker-input"
          type="text"
          v-model="selectedTicker"
          @input="onTickerInput"
          placeholder="Введите тикер"
      />
    </div>

    <div v-if="$route.name === 'tradesList'">
      <AlorTrades v-show="false"/>
      <!-- <AlorOrderbooks v-show="false"/> -->
    </div>

    <div>
      <!-- Вывод локальной копии сделок с выбранным тикером -->
      <!-- <div v-for="trade in lastTickerTrades" :key="trade.id">
              {{ trade }}
            </div> -->
    </div>

    <div id="ticker-container">
      <!-- Лента для покупок -->
      <div ref="tickerColumnBuy" class="ticker-column">
        <div ref="tickerListBuy" class="ticker-list"></div>
      </div>
      <!-- Лента для продаж -->
      <div ref="tickerColumnSell" class="ticker-column">
        <div ref="tickerListSell" class="ticker-list"></div>
      </div>
    </div>

    <!-- Блок с накопленными суммами и прогрессбаром для выбранного тикера -->
    <div id="totals-container">
      <div class="total-column">
        <!-- Прогресс-бар, ширина которого зависит от процента покупок -->
        <div
            class="progress-bar progress-buy"
            :style="{ width: buyPercentage + '%' }"
        ></div>
        <span class="amount amount-buy">{{ Math.round(accumulatedBuy).toLocaleString('ru-RU') }} Р</span>
      </div>
      <div class="total-column">
        <!-- Прогресс-бар, ширина которого зависит от процента продаж -->
        <div
            class="progress-bar progress-sell"
            :style="{ width: sellPercentage + '%' }"
        ></div>
        <span class="amount amount-sell">{{ Math.round(accumulatedSell).toLocaleString('ru-RU') }} Р</span>
      </div>
    </div>

    <!-- Новые блоки для отображения глобальных (общих) сумм по всем тикерам -->
    <div id="global-totals-container">
      <div class="total-column">
        <div
            class="progress-bar progress-buy"
            :style="{ width: globalBuyPercentage + '%' }"
        ></div>
        <span class="amount amount-buy">{{ Math.round(globalAccumulatedBuy).toLocaleString('ru-RU') }} Р</span>
      </div>
      <div class="total-column">
        <div
            class="progress-bar progress-sell"
            :style="{ width: globalSellPercentage + '%' }"
        ></div>
        <span class="amount amount-sell">{{ Math.round(globalAccumulatedSell).toLocaleString('ru-RU') }} Р</span>
      </div>
    </div>

    <!-- Кнопка сброса, вызывающая метод resetTickerData -->
    <div class="reset-button" style="padding: 10px 0;">
      <button @click="resetTickerData">Сброс тикера</button>
      <button @click="resetGlobalData">Сброс сумм</button>
    </div>

  </div>
</template>

<script>
import { tickersLots } from '../tickersLots.js';
//import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useTradesStore } from '@/stores/tradesStore';
import AlorTrades from "@/components/AlorTrades.vue";
//import AlorOrderbooks from "@/components/AlorOrderbooks.vue";

export default {
  name: 'TradesList',
  components: {
    //AlorOrderbooks,
    AlorTrades
  },

  setup() {
    const tradesStore = useTradesStore();
    return { tradesStore };
  },

  data() {
    return {
      tickersLots,
      // Текущий выбранный тикер, по умолчанию 'FLOT'
      selectedTicker: 'FLOT',
      lastTickerTrades: [],
      // Режим: true — фейковые данные, false — реальные трейды
      useFakeData: false,
      // Набор id уже обработанных сделок для выбранного тикера
      processedTradeIds: new Set(),
      // Набор id уже обработанных сделок для глобальных данных
      processedGlobalTradeIds: new Set(),

      // Очереди для анимации ленты (выбранный тикер)
      pendingDataBuy: [],
      pendingDataSell: [],
      recentTradesBuy: [],
      recentTradesSell: [],
      // Переменные для анимации
      rowsBuy: [],
      rowsSell: [],
      offsetBuy: 0,
      offsetSell: 0,
      running: true,
      tradeTimeout: null,

      // Накопленные суммы с момента старта приложения для выбранного тикера
      accumulatedBuy: 0,
      accumulatedSell: 0,

      // Глобальные накопленные суммы по всем тикерам
      globalAccumulatedBuy: 0,
      globalAccumulatedSell: 0
    }
  },

  computed: {
    totalSum() {
      return this.accumulatedBuy + this.accumulatedSell;
    },
    buyPercentage() {
      return this.totalSum ? (this.accumulatedBuy / this.totalSum) * 100 : 0;
    },
    sellPercentage() {
      return this.totalSum ? (this.accumulatedSell / this.totalSum) * 100 : 0;
    },
    globalTotalSum() {
      return this.globalAccumulatedBuy + this.globalAccumulatedSell;
    },
    globalBuyPercentage() {
      return this.globalTotalSum ? (this.globalAccumulatedBuy / this.globalTotalSum) * 100 : 0;
    },
    globalSellPercentage() {
      return this.globalTotalSum ? (this.globalAccumulatedSell / this.globalTotalSum) * 100 : 0;
    }
  },

  watch: {
    'tradesStore.newTrades': {
      handler(newTrades) {
        if (newTrades && Array.isArray(newTrades)) {
          // Обработка для глобальных сумм по всем тикерам
          newTrades.forEach(trade => {
            const computedGlobalId = trade.tradeId || (trade.time + '-' + Math.random());
            if (!this.processedGlobalTradeIds.has(computedGlobalId)) {
              this.processedGlobalTradeIds.add(computedGlobalId);
              const lotSizeGlobal = this.tickersLots[trade.ticker] || 10;
              const computedSum = trade.qty * trade.price * lotSizeGlobal;
              if (trade.side === 'buy') {
                this.globalAccumulatedBuy += computedSum;
              } else {
                this.globalAccumulatedSell += computedSum;
              }
            }
          });

          // Обработка сделок для выбранного тикера, если такой тикер есть в tickersLots
          if (this.tickersLots[this.selectedTicker]) {
            const filtered = newTrades.filter(trade => trade.ticker === this.selectedTicker);
            if (filtered.length > 0) {
              this.lastTickerTrades = filtered;
            }
            if (!this.useFakeData) {
              newTrades.forEach(trade => {
                if (trade.ticker === this.selectedTicker) {
                  const computedId = trade.tradeId || (trade.time + '-' + Math.random());
                  if (!this.processedTradeIds.has(computedId)) {
                    this.processedTradeIds.add(computedId);
                    const lotSize = this.tickersLots[this.selectedTicker];
                    const computedSum = trade.qty * trade.price * lotSize;
                    const formattedTime = new Date(trade.time).toLocaleTimeString();
                    const tradeItem = {
                      id: computedId,
                      text: `${Math.round(computedSum).toLocaleString('ru-RU')} Р`,
                      timestamp: new Date(trade.time).getTime(),
                      quantity: trade.qty,
                      price: trade.price,
                      side: trade.side,
                      sum: computedSum,
                      time: formattedTime
                    };
                    if (trade.side === 'buy') {
                      this.accumulatedBuy += computedSum;
                      this.pendingDataBuy.push(tradeItem);
                      this.recentTradesBuy.push(tradeItem);
                    } else {
                      this.accumulatedSell += computedSum;
                      this.pendingDataSell.push(tradeItem);
                      this.recentTradesSell.push(tradeItem);
                    }
                  }
                }
              });
            }
          }
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    resetGlobalData() {
      this.globalAccumulatedBuy = 0;
      this.globalAccumulatedSell = 0;
      this.processedGlobalTradeIds.clear();
    },

    // Сброс состояния ленты для выбранного тикера (глобальные суммы остаются)
    resetTickerData() {
      this.pendingDataBuy = [];
      this.pendingDataSell = [];
      this.recentTradesBuy = [];
      this.recentTradesSell = [];
      this.lastTickerTrades = [];
      this.accumulatedBuy = 0;
      this.accumulatedSell = 0;
      this.processedTradeIds.clear();
    },

    // Обработчик изменения тикера
    onTickerInput() {
      this.resetTickerData();
      // Лента будет работать только если выбранный тикер есть в списке tickersLots
    },

    // Функция генерации фейковых сделок (используется в режиме fake)
    generateFakeTrades() {
      let count = 0;
      const r = Math.random();
      if (r < 0.5) {
        count = 0;
      } else if (r < 0.8) {
        count = Math.floor(Math.random() * 20) + 1;
      } else {
        count = Math.floor(Math.random() * 250) + 50;
      }
      const now = Date.now();
      const lotSize = this.tickersLots[this.selectedTicker] || 10;
      for (let i = 0; i < count; i++) {
        const isBuy = Math.random() > 0.5;
        const quantity = Math.floor(Math.random() * 100) + 1;
        const price = 100 + Math.random() * 10;
        const computedSum = quantity * price * lotSize;
        const formattedTime = new Date(now).toLocaleTimeString();
        const trade = {
          id: Date.now() + Math.random(),
          direction: isBuy ? 'buy' : 'sell',
          quantity: quantity,
          price: price,
          sum: computedSum,
          time: formattedTime,
          text: `${isBuy ? 'Buy' : 'Sell'} | Qty: ${quantity} | Price: ${price.toFixed(2)} | Sum: ${computedSum.toFixed(2)} | Time: ${formattedTime}`,
          timestamp: now,
          ticker: this.selectedTicker,
          side: isBuy ? 'buy' : 'sell'
        };
        // Обновляем глобальные суммы
        if (isBuy) {
          this.globalAccumulatedBuy += computedSum;
        } else {
          this.globalAccumulatedSell += computedSum;
        }
        // Обновляем суммы для выбранного тикера
        if (isBuy) {
          this.accumulatedBuy += computedSum;
          this.pendingDataBuy.push(trade);
          this.recentTradesBuy.push(trade);
        } else {
          this.accumulatedSell += computedSum;
          this.pendingDataSell.push(trade);
          this.recentTradesSell.push(trade);
        }
      }
      let nextDelay;
      if (count === 0) {
        nextDelay = Math.random() * 2000 + 3000;
      } else {
        nextDelay = Math.random() * 2500 + 500;
      }
      this.tradeTimeout = setTimeout(this.generateFakeTrades, nextDelay);
    },

    // Переключение между режимами фейковых данных и реальных трейдов
    toggleDataMode() {
      this.useFakeData = !this.useFakeData;
      this.pendingDataBuy = [];
      this.pendingDataSell = [];
      this.recentTradesBuy = [];
      this.recentTradesSell = [];
      if (this.useFakeData) {
        this.lastProcessedIndex = 0;
        this.generateFakeTrades();
      } else {
        if (this.tradeTimeout) {
          clearTimeout(this.tradeTimeout);
          this.tradeTimeout = null;
        }
        this.lastProcessedIndex = this.tradesStore.newTrades ? this.tradesStore.newTrades.length : 0;
      }
    }
  },

  mounted() {
    /***** Константы анимации *****/
    const ROW_HEIGHT = 20;
    const BUFFER_ROWS = 500;
    const TARGET_VOLUME = 3000000;
    const VOLUME_WINDOW = 15000;
    const DECAY_TIME = 10000;
    const MIN_SPEED = 0.01;
    const MAX_SPEED = 0.3;

    let lastTimeBuy = performance.now();
    let lastTimeSell = performance.now();

    /***** Создание строк для лент покупок и продаж *****/
    for (let i = 0; i < BUFFER_ROWS; i++) {
      const rowBuy = document.createElement('div');
      rowBuy.className = 'trade empty';
      rowBuy.innerHTML = '&nbsp;';
      this.$refs.tickerListBuy.appendChild(rowBuy);
      this.rowsBuy.push(rowBuy);

      const rowSell = document.createElement('div');
      rowSell.className = 'trade empty';
      rowSell.innerHTML = '&nbsp;';
      this.$refs.tickerListSell.appendChild(rowSell);
      this.rowsSell.push(rowSell);
    }

    /***** Функции ротации строк *****/
    const rotateRowsBuy = () => {
      const row = this.rowsBuy.pop();
      if (this.pendingDataBuy.length > 0) {
        const trade = this.pendingDataBuy.shift();
        row.className = 'trade buy';
        row.innerText = trade.text;
      } else {
        row.className = 'trade empty';
        row.innerHTML = '&nbsp;';
      }
      if (!this.$refs.tickerListBuy) return;
      this.$refs.tickerListBuy.insertBefore(row, this.$refs.tickerListBuy.firstChild);
      this.rowsBuy.unshift(row);
    };

    const rotateRowsSell = () => {
      const row = this.rowsSell.pop();
      if (this.pendingDataSell.length > 0) {
        const trade = this.pendingDataSell.shift();
        row.className = 'trade sell';
        row.innerText = trade.text;
      } else {
        row.className = 'trade empty';
        row.innerHTML = '&nbsp;';
      }
      if (!this.$refs.tickerListSell) return;
      this.$refs.tickerListSell.insertBefore(row, this.$refs.tickerListSell.firstChild);
      this.rowsSell.unshift(row);
    };

    /***** Анимация ленты покупок *****/
    const animateBuy = () => {
      const now = performance.now();
      const dt = now - lastTimeBuy;
      lastTimeBuy = now;
      const currentTime = Date.now();
      this.recentTradesBuy = this.recentTradesBuy.filter(trade => trade.timestamp >= currentTime - VOLUME_WINDOW);
      const lotSize = this.tickersLots[this.selectedTicker] || 10;
      let weightedVolumeBuy = 0;
      this.recentTradesBuy.forEach(trade => {
        const age = currentTime - trade.timestamp;
        const weight = Math.exp(-age / DECAY_TIME);
        weightedVolumeBuy += trade.quantity * trade.price * weight * lotSize;
      });
      const fraction = Math.min(weightedVolumeBuy / TARGET_VOLUME, 1);
      const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * fraction;
      this.offsetBuy += speed * dt;
      if (this.offsetBuy >= ROW_HEIGHT) {
        this.offsetBuy -= ROW_HEIGHT;
        rotateRowsBuy();
      }
      if (!this.$refs.tickerListBuy) return;
      this.$refs.tickerListBuy.style.transform = `translateY(${this.offsetBuy}px)`;
      if (this.running) {
        requestAnimationFrame(animateBuy);
      }
    };

    /***** Анимация ленты продаж *****/
    const animateSell = () => {
      const now = performance.now();
      const dt = now - lastTimeSell;
      lastTimeSell = now;
      const currentTime = Date.now();
      this.recentTradesSell = this.recentTradesSell.filter(trade => trade.timestamp >= currentTime - VOLUME_WINDOW);
      const lotSize = this.tickersLots[this.selectedTicker] || 10;
      let weightedVolumeSell = 0;
      this.recentTradesSell.forEach(trade => {
        const age = currentTime - trade.timestamp;
        const weight = Math.exp(-age / DECAY_TIME);
        weightedVolumeSell += trade.quantity * trade.price * weight * lotSize;
      });
      const fraction = Math.min(weightedVolumeSell / TARGET_VOLUME, 1);
      const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * fraction;
      this.offsetSell += speed * dt;
      if (this.offsetSell >= ROW_HEIGHT) {
        this.offsetSell -= ROW_HEIGHT;
        rotateRowsSell();
      }
      if (!this.$refs.tickerListSell) return;
      this.$refs.tickerListSell.style.transform = `translateY(${this.offsetSell}px)`;
      if (this.running) {
        requestAnimationFrame(animateSell);
      }
    };

    requestAnimationFrame(animateBuy);
    requestAnimationFrame(animateSell);

    if (this.useFakeData) {
      this.generateFakeTrades();
    }
  },

  beforeUnmount() {
    this.running = false;
    if (this.tradeTimeout) {
      clearTimeout(this.tradeTimeout);
    }
  }
}
</script>

<style>

.toggle-mode{
  padding: 10px 0 0;
}

.trades-list{
  max-width: 200px;
  margin: 0 auto;
}

/* Контейнер для поля ввода тикера */
#ticker-input-container {
  padding: 10px 0;
}

/* Контейнер для двух лент, расположенных рядом */
#ticker-container {
  display: flex;
  justify-content: space-between;
  max-width: 200px;
  height: 300px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Колонка для одной ленты */
.ticker-column {
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.ticker-column:last-child {
  border-right: none;
}

/* Список строк ленты */
.ticker-list {
  position: absolute;
  width: 100%;
  top: -30px;
  left: 0;
  white-space: nowrap;
}

/* Стили строк (сделок) */
.trade {
  height: 20px;
  line-height: 20px;
  padding: 0 10px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.01);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.trade.empty {
  color: #aaa;
}

.trade.buy {
  color: #72cc72;
}

.trade.sell {
  color: #f67582;
}

/* Стили для блока с накопленными суммами и прогрессбаром */
#totals-container,
#global-totals-container {
  display: flex;
  justify-content: space-between;
  max-width: 200px;
  margin: 10px auto 0;
}

.total-column {
  position: relative;
  width: 50%;
  text-align: left;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
}

/* Прогресс-бар внутри колонки */
.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 0;
}

/* Заливка для покупок и продаж */
.progress-buy {
  background-color: #3a983a;
}

.progress-sell {
  background-color: #b6414c;
}

/* Текст суммы, который располагается поверх прогресс-бара */
.amount {
  position: relative;
  z-index: 1;
  display: block;
  padding: 3px 5px;
  white-space: nowrap;
}

.amount-buy {
  color: #b6ffb6;
}

.amount-sell {
  color: #ffc6d0;
}
</style>
