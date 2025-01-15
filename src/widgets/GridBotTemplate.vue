<template>
  <div class="grid-bot-container">
    <h1>Grid Bot (Vue SFC)</h1>

    <!-- Блок настроек -->
    <div class="section">
      <h2>Настройки</h2>
      <label>
        <input type="checkbox" v-model="config.enableGridShift" />
        Включить смещение сетки
      </label>
      <label>Интервал смещения сетки (ms):
        <input type="number" v-model.number="config.gridShiftInterval" min="1000" />
      </label>


      <!-- Существующие настройки -->
      <label>Начальная цена:
        <input type="number" v-model.number="config.priceStart" step="0.1" />
      </label>
      <label>Шаг сетки:
        <input type="number" v-model.number="config.gridStep" step="0.1" />
      </label>
      <label>Уровней:
        <input type="number" v-model.number="config.levelsCount" />
      </label>
      <label>Объём лотов:
        <input type="number" v-model.number="config.volume" />
      </label>
      <label>Тейк-профит:
        <input type="number" v-model.number="config.takeProfitDistance" step="0.1" />
      </label>
      <label>Волатильность:
        <input type="number" v-model.number="config.volatility" step="0.1" />
      </label>
      <label>Интервал (ms):
        <input type="number" v-model.number="config.interval" />
      </label>
      <!-- Новые настройки -->
      <label>
        <input type="checkbox" v-model="config.enableRestore" />
        Включить восстановление лимиток
      </label>
      <label>Количество восстанавливаемых лимиток:
        <input type="number" v-model.number="config.restoreCount" min="1" />
      </label>
      <button @click="applySettings">Применить</button>
    </div>

    <!-- Блок управления -->
    <div class="section">
      <button @click="startSimulation">Старт</button>
      <button @click="stopSimulation">Стоп</button>
      <strong>Текущая цена:</strong> {{ currentPriceStr }}
      <div>
        Осталось лимиток для восстановления: {{ state.remainingRestoreCount }}
      </div>
      <div class="log" ref="logBox">
        <pre>{{ logText }}</pre>
      </div>
    </div>

    <!-- Canvas для Chart.js -->
    <canvas ref="chartCanvas" width="600" height="300"></canvas>

    <!-- Таблица ордеров -->
    <div class="section">
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
          <!-- BUY -->
          <td>
            <div v-for="bo in state.buyLevels" :key="bo.price">
              @{{ bo.price.toFixed(2) }} x {{ bo.volume }}
            </div>
          </td>
          <!-- SELL -->
          <td>
            <div v-for="so in state.sellOrders" :key="so.price">
              @{{ so.price.toFixed(2) }} x {{ so.volume }}
            </div>
          </td>
          <!-- OPEN TRADES -->
          <td>
            <div v-for="(ot, idx) in state.openTrades" :key="idx">
              BUY@{{ ot.buyPrice.toFixed(2) }},
              TP@{{ ot.takeProfit.toFixed(2) }},
              vol={{ ot.volume }}
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- История закрытых сделок -->
    <div class="section">
      <h2>Закрытые сделки</h2>
      <table>
        <thead>
        <tr>
          <th>BuyPrice</th>
          <th>SellPrice</th>
          <th>Volume</th>
          <th>Profit</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(ct, cidx) in state.closedTrades" :key="cidx">
          <td>{{ ct.buyPrice.toFixed(2) }}</td>
          <td>{{ ct.sellPrice.toFixed(2) }}</td>
          <td>{{ ct.volume }}</td>
          <td>{{ ct.profit.toFixed(2) }}</td>
        </tr>
        </tbody>
      </table>
      <strong>Суммарная прибыль:</strong> {{ state.totalProfit.toFixed(2) }}
    </div>

  </div>
</template>

<script>
import { ref, onMounted, reactive, computed, markRaw, toRaw } from "vue";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "GridBotTemplate",

  setup() {
    // ========== РЕАКТИВНЫЕ ДАННЫЕ ==========

    const config = reactive({
      priceStart: 100,
      gridStep: 1,
      levelsCount: 3,
      volume: 10,
      takeProfitDistance: 2,
      volatility: 0.5,
      interval: 1000,
      enableRestore: false,
      restoreCount: 3,
      enableGridShift: false, // Новый параметр: включение смещения сетки
      gridShiftInterval: 5000, // Новый параметр: интервал смещения сетки
      gridShiftIntervals: [3000, 5000, 7000],
    });


    const state = reactive({
      remainingRestoreCount: 0,
      currentPrice: 100,
      simulationId: null,
      timeIndex: 0,

      buyLevels: [],
      sellOrders: [],
      openTrades: [],
      closedTrades: [],
      totalProfit: 0,

      priceData: [],
      linesData: [],

      // Добавили для точек входа/выхода
      buyPoints: [],
      sellPoints: [],
    });

    // Для вывода лога
    const logText = ref("");

    // Ссылки на DOM-элементы
    const chartCanvas = ref(null);
    const logBox = ref(null);

    // Chart.js объект
    let chartInstance = null;

    // ========== COMPUTED / GETTERS ==========
    const currentPriceStr = computed(() =>
        state.currentPrice.toFixed(2)
    );

    // ========== МЕТОДЫ ==========

    function log(msg) {
      logText.value += msg + "\n";
      // Автопрокрутка лога
      if (logBox.value) {
        logBox.value.scrollTop = logBox.value.scrollHeight;
      }
    }

    //let gridShiftTimer = null;

    function shiftGrid() {
      if (!config.enableGridShift) return; // Проверяем, включена ли функция

      log("Смещаем сетку в соответствии с текущей ценой...");
      config.priceStart = state.currentPrice; // Обновляем начальную цену

      // Очищаем текущие уровни и линии
      state.buyLevels = [];
      state.sellOrders = [];
      state.linesData = [];

      // Пересчитываем buy-ордера с учетом оставшихся лимиток
      let remainingLevels = Math.min(config.levelsCount, state.remainingRestoreCount);
      for (let i = 1; i <= remainingLevels; i++) {
        const levelPrice = config.priceStart - i * config.gridStep;
        state.buyLevels.push({
          price: levelPrice,
          volume: config.volume,
        });
        state.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "green",
        });
      }

      // Обновляем оставшийся лимит
      state.remainingRestoreCount -= remainingLevels;
      log(`Осталось лимиток для восстановления: ${state.remainingRestoreCount}`);

      updateChart();

      // Устанавливаем следующий таймер
      if (config.enableGridShift) {
        const randomInterval =
            config.gridShiftIntervals[
                Math.floor(Math.random() * config.gridShiftIntervals.length)
                ]; // Выбираем случайный интервал

        gridShiftTimer = setTimeout(() => {
          shiftGrid();
        }, randomInterval);

        log(`Следующее смещение через ${randomInterval} мс`);
      }
    }



    let gridShiftTimer = null;


    /*// Запуск симуляции
    function startSimulation() {
      if (state.simulationId) {
        log("Симуляция уже идёт!");
        return;
      }
      log("=== START ===");
      resetState();

      state.simulationId = setInterval(() => {
        simulate();
      }, config.interval);
    }

    // Остановка
    function stopSimulation() {
      if (!state.simulationId) {
        log("Симуляция не запущена!");
        return;
      }
      clearInterval(state.simulationId);
      state.simulationId = null;
      log("=== STOP ===");
    }
*/
    function startSimulation() {
      if (state.simulationId) {
        log("Симуляция уже идёт!");
        return;
      }
      log("=== START ===");
      resetState();

      // Запуск основного таймера
      state.simulationId = setInterval(() => {
        simulate();
      }, config.interval);

      // Запуск смещения сетки через setTimeout
      if (config.enableGridShift) {
        shiftGrid(); // Первый вызов смещения
      }
    }

    function stopSimulation() {
      if (!state.simulationId) {
        log("Симуляция не запущена!");
        return;
      }
      clearInterval(state.simulationId);
      state.simulationId = null;

      // Остановка таймера смещения сетки
      if (gridShiftTimer) {
        clearTimeout(gridShiftTimer);
        gridShiftTimer = null;
      }

      log("=== STOP ===");
    }



    function applySettings() {
      log("Применили настройки: " + JSON.stringify({
        priceStart: config.priceStart,
        gridStep: config.gridStep,
        levelsCount: config.levelsCount,
        volume: config.volume,
        takeProfitDistance: config.takeProfitDistance,
        volatility: config.volatility,
        interval: config.interval
      }));
      state.remainingRestoreCount = config.restoreCount; // Установить начальное значение

      resetState();
    }

    function resetState() {
      state.currentPrice = config.priceStart;
      state.timeIndex = 0;

      state.buyLevels = [];
      state.sellOrders = [];
      state.openTrades = [];
      state.closedTrades = [];
      state.totalProfit = 0;

      state.priceData = [];
      state.linesData = [];

      // Сбрасываем массивы точек
      state.buyPoints = [];
      state.sellPoints = [];

      // Инициализируем все buy-лимитки
      initBuyOrders();

      // Первая точка цены
      state.priceData.push({x: 0, y: state.currentPrice});

      updateChart();
    }

    // Заранее выставить buy-ордера (сетку)
    function initBuyOrders() {
      for (let i = 1; i <= config.levelsCount; i++) {
        const levelPrice = config.priceStart - i * config.gridStep;
        state.buyLevels.push({
          price: levelPrice,
          volume: config.volume
        });
        // Можно сразу добавлять линию в linesData, если хотим рисовать
        state.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "green"
        });
      }
    }

    // Один "тик"
    function simulate() {
      state.timeIndex++;
      const delta =
          (Math.random() * (config.volatility * 2)) - config.volatility;
      state.currentPrice += delta;
      if (state.currentPrice < 0) state.currentPrice = 0.1;

      // добавляем точку на график
      state.priceData.push({x: state.timeIndex, y: state.currentPrice});

      // Проверяем buy-ордера
      checkBuyOrders();
      // Проверяем sell-ордера (TP)
      checkSellOrders();

      updateChart();
    }

    function checkBuyOrders() {
      // Если currentPrice <= buyOrder.price => исполнилась покупка
      for (let i = 0; i < state.buyLevels.length; i++) {
        const bo = state.buyLevels[i];
        if (state.currentPrice <= bo.price) {
          log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);
          state.buyLevels.splice(i, 1);
          i--;
          removeLine("BUY_" + bo.price);

          // Добавляем точку входа
          state.buyPoints.push({x: state.timeIndex, y: bo.price});

          // Создаём "микро" сделку
          const trade = {
            buyPrice: bo.price,
            volume: bo.volume,
            takeProfit: bo.price + config.takeProfitDistance
          };
          state.openTrades.push(trade);

          // Ставим соответствующий sell-order (TP)
          const so = {
            price: trade.takeProfit,
            volume: trade.volume,
            linkBuy: trade.buyPrice
          };
          state.sellOrders.push(so);

          state.linesData.push({
            id: "SELL_" + so.price,
            price: so.price,
            color: "red"
          });
        }
      }
    }

    function checkSellOrders() {
      for (let j = 0; j < state.sellOrders.length; j++) {
        const so = state.sellOrders[j];
        if (state.currentPrice >= so.price) {
          log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);
          state.sellOrders.splice(j, 1);
          j--;
          removeLine("SELL_" + so.price);

          // Добавляем точку выхода
          state.sellPoints.push({ x: state.timeIndex, y: so.price });

          // Находим в openTrades
          const idx = state.openTrades.findIndex((t) => t.buyPrice === so.linkBuy);
          if (idx >= 0) {
            const tr = state.openTrades[idx];
            const profit = (so.price - tr.buyPrice) * tr.volume;
            state.totalProfit += profit;
            state.closedTrades.push({
              buyPrice: tr.buyPrice,
              sellPrice: so.price,
              volume: tr.volume,
              profit,
            });
            state.openTrades.splice(idx, 1);

            // Логика восстановления лимиток
            if (config.enableRestore && state.remainingRestoreCount > 0) {
              state.buyLevels.push({
                price: tr.buyPrice,
                volume: config.volume,
              });
              state.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "green", // Цвет линии для восстановленных лимиток
              });
              state.remainingRestoreCount--;
              log(`Restored BUY limit @${tr.buyPrice.toFixed(2)}. Remaining: ${state.remainingRestoreCount}`);
            }
          }
        }
      }
    }


    function removeLine(id) {
      const idx = state.linesData.findIndex(l => l.id === id);
      if (idx >= 0) {
        state.linesData.splice(idx, 1);
      }
    }

    // ========== CHART.JS ==========

    function initChartInstance() {
      const ctx = chartCanvas.value.getContext("2d");
      chartInstance = markRaw(new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Price",
              data: [],
              borderColor: "blue",
              backgroundColor: "rgba(0,0,255,0.1)",
              fill: true
            },
            {
              label: "Lines",
              data: [],
              borderColor: "orange",
              borderDash: [5, 5],
              showLine: true,
              pointRadius: 0,
              fill: false,
              spanGaps: false
            },
            {
              label: "Buy Points",
              data: [], // будет заполнено из state.buyPoints
              showLine: false,
              pointStyle: "triangle",
              pointRadius: 5,
              borderColor: "green",
              backgroundColor: "green",
              //order: 99,
            },
            {
              label: "Sell Points",
              data: [], // будет заполнено из state.sellPoints
              showLine: false,
              pointStyle: "rect",
              pointRadius: 5,
              borderColor: "red",
              backgroundColor: "red",
              //order: 99
            }
          ]
        },
        options: {
          animation: false,
          scales: {
            x: {type: "linear", position: "bottom"},
            y: {beginAtZero: false}
          }
        }
      }));
    }

    function updateChart() {
      if (!chartInstance) return;

      // 1) Price (сырые данные, без Proxy)
      const rawPriceData = toRaw(state.priceData);
      chartInstance.data.datasets[0].data = rawPriceData;

      // 2) Lines
      const rawLines = toRaw(state.linesData);
      const linesPoints = [];
      for (const line of rawLines) {
        linesPoints.push({
          x: 0,
          y: line.price,
          color: line.color, // Учитываем цвет линии
        });
        linesPoints.push({
          x: state.timeIndex + 5,
          y: line.price,
          color: line.color,
        });
        linesPoints.push({ x: null, y: null });
      }
      chartInstance.data.datasets[1].data = linesPoints;

      // 3) Buy Points
      const rawBuyPoints = toRaw(state.buyPoints);
      chartInstance.data.datasets[2].data = rawBuyPoints;

      // 4) Sell Points
      const rawSellPoints = toRaw(state.sellPoints);
      chartInstance.data.datasets[3].data = rawSellPoints;

      chartInstance.update();
    }

    // Хук жизненного цикла, аналог mounted()
    onMounted(() => {
      initChartInstance();
      resetState(); // сразу настроим всё
    });

    // Возвращаем то, что нужно шаблону
    return {
      config,
      state,

      logText,
      currentPriceStr,

      chartCanvas,
      logBox,

      applySettings,
      startSimulation,
      stopSimulation
    };
  }
};
</script>

<style scoped>
.grid-bot-container {
  font-family: sans-serif;
}

.section {
  background: #242737;
  border: 1px solid #404562;
  padding: 10px;
  margin-bottom: 10px;
}

.log {
  background: #242737;
  height: 120px;
  overflow-y: auto;
  border: 1px solid #404562;
  margin-top: 10px;
}
</style>
