<template>
  <div>
    <!-- Кнопка для переключения между режимами -->
    <button @click="toggleDataMode">
      {{ useFakeData ? 'Switch to Real Trades' : 'Switch to Fake Data' }}
    </button>

    <div v-if="$route.name === 'tradesList'">
      <AlorTrades v-show="false"/>
      <!-- <AlorOrderbooks v-show="false"/> -->
    </div>

    <div>
      <!-- Вывод локальной копии сделок с тикером 'FLOT' -->
      <!-- <div v-for="trade in lastFlotTrades" :key="trade.id">
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

    <!-- Блок с накопленными суммами и прогрессбаром -->
    <div id="totals-container">
      <div class="total-column">
        <!-- Прогресс-бар, ширина которого зависит от процента покупок -->
        <div
            class="progress-bar progress-buy"
            :style="{ width: buyPercentage + '%' }"
        ></div>
        <span class="amount amount-buy">{{ Math.round(accumulatedBuy) }} Р</span>
      </div>
      <div class="total-column">
        <!-- Прогресс-бар, ширина которого зависит от процента продаж -->
        <div
            class="progress-bar progress-sell"
            :style="{ width: sellPercentage + '%' }"
        ></div>
        <span class="amount amount-sell">{{ Math.round(accumulatedSell) }} Р</span>
      </div>
    </div>
  </div>
</template>

<script>
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

  // Используем Composition API для получения хранилища
  setup() {
    const tradesStore = useTradesStore();
    return { tradesStore };
  },

  data() {
    return {
      lastFlotTrades: [],
      // Режим: true — фейковые данные, false — реальные трейды
      useFakeData: false,
      // Вместо индекса обработанных сделок – набор id уже обработанных трейдов
      processedTradeIds: new Set(),

      // Очереди для анимации ленты
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

      // Накопленные суммы с момента старта приложения
      accumulatedBuy: 0,
      accumulatedSell: 0
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
    }
  },

  watch: {
    'tradesStore.newTrades': {
      handler(newTrades) {
        if (newTrades && Array.isArray(newTrades)) {
          // Обновляем локальную копию для визуального отображения списка
          const filtered = newTrades.filter(trade => trade.ticker === 'FLOT');
          if (filtered.length > 0) {
            this.lastFlotTrades = filtered;
          }
          // Если в режиме реальных трейдов, обрабатываем новые сделки, которые ещё не были обработаны
          if (!this.useFakeData) {
            newTrades.forEach(trade => {
              if (trade.ticker === 'FLOT') {
                const computedId = trade.tradeId || (trade.time + '-' + Math.random());
                if (!this.processedTradeIds.has(computedId)) {
                  this.processedTradeIds.add(computedId);
                  const computedSum = trade.qty * trade.price * 10;
                  const formattedTime = new Date(trade.time).toLocaleTimeString();
                  const tradeItem = {
                    id: computedId,
                    text: `${Math.round( computedSum)} Руб`,
                    timestamp: new Date(trade.time).getTime(),
                    quantity: trade.qty,
                    price: trade.price,
                    side: trade.side,
                    sum: computedSum,
                    time: formattedTime
                  };
                  // Обновляем накопленные суммы
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
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // Функция генерации фейковых сделок (используется в режиме fake)
    generateFakeTrades() {
      let count = 0;
      const r = Math.random();
      if (r < 0.5) {
        // Затишье — сделок нет
        count = 0;
      } else if (r < 0.8) {
        // Маленький burst (1–20 сделок)
        count = Math.floor(Math.random() * 20) + 1;
      } else {
        // Большой burst (50–300 сделок)
        count = Math.floor(Math.random() * 250) + 50;
      }
      const now = Date.now();
      for (let i = 0; i < count; i++) {
        const isBuy = Math.random() > 0.5;
        const quantity = Math.floor(Math.random() * 100) + 1;
        const price = 100 + Math.random() * 10;
        const computedSum = quantity * price;
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
          ticker: 'FLOT',
          side: isBuy ? 'buy' : 'sell'
        };
        // Обновляем накопленные суммы для фейковых сделок
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
        nextDelay = Math.random() * 2000 + 3000; // 3–5 сек
      } else {
        nextDelay = Math.random() * 2500 + 500;    // 0.5–3 сек
      }
      this.tradeTimeout = setTimeout(this.generateFakeTrades, nextDelay);
    },

    // Переключение между режимами фейковых данных и реальных трейдов
    toggleDataMode() {
      this.useFakeData = !this.useFakeData;
      // Очищаем очереди для анимации
      this.pendingDataBuy = [];
      this.pendingDataSell = [];
      this.recentTradesBuy = [];
      this.recentTradesSell = [];
      if (this.useFakeData) {
        // При переходе в режим фейковых данных сбрасываем индекс реальных сделок
        this.lastProcessedIndex = 0;
        // Запускаем генерацию фейковых сделок
        this.generateFakeTrades();
      } else {
        // При переходе в режим реальных трейдов — останавливаем фейковую генерацию
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
    const ROW_HEIGHT = 20;           // высота одной строки (px)
    const BUFFER_ROWS = 500;         // фиксированное число строк в ленте
    const TARGET_VOLUME = 1000000;
    const VOLUME_WINDOW = 15000;
    const DECAY_TIME = 10000;
    const MIN_SPEED = 0.01;
    const MAX_SPEED = 0.3;

    let lastTimeBuy = performance.now();
    let lastTimeSell = performance.now();

    /***** Создание строк для лент покупок и продаж *****/
    for (let i = 0; i < BUFFER_ROWS; i++) {
      // Строки для ленты покупок
      const rowBuy = document.createElement('div');
      rowBuy.className = 'trade empty';
      rowBuy.innerHTML = '&nbsp;';
      this.$refs.tickerListBuy.appendChild(rowBuy);
      this.rowsBuy.push(rowBuy);

      // Строки для ленты продаж
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
      let weightedVolumeBuy = 0;
      this.recentTradesBuy.forEach(trade => {
        const age = currentTime - trade.timestamp;
        const weight = Math.exp(-age / DECAY_TIME);
        weightedVolumeBuy += trade.quantity * trade.price * weight;
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
      let weightedVolumeSell = 0;
      this.recentTradesSell.forEach(trade => {
        const age = currentTime - trade.timestamp;
        const weight = Math.exp(-age / DECAY_TIME);
        weightedVolumeSell += trade.quantity * trade.price * weight * 10; // 10 - lots
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

    // Запуск анимаций
    requestAnimationFrame(animateBuy);
    requestAnimationFrame(animateSell);

    // Если выбран режим фейковых данных, запускаем их генерацию
    if (this.useFakeData) {
      this.generateFakeTrades();
    }
  },

  beforeUnmount() {
    // Останавливаем анимацию и генерацию сделок
    this.running = false;
    if (this.tradeTimeout) {
      clearTimeout(this.tradeTimeout);
    }
  }
}
</script>

<style>
/* Контейнер для двух лент, расположенных рядом */
#ticker-container {
  display: flex;
  justify-content: space-between;
  max-width: 150px; /* можно настроить */
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
#totals-container {
  display: flex;
  justify-content: space-between;
  max-width: 150px;
  margin: 10px auto 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.total-column {
  position: relative;
  width: 50%;
  text-align: center;
  overflow: hidden;
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
  padding: 4px 2px;
  white-space: nowrap;
  /* Измените цвет шрифта по необходимости */
}

.amount-buy {
  color: #b6ffb6;
}

.amount-sell {
  color: #ffc6d0;
}
</style>
