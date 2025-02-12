<template>
    <div class="mesh-bot">

      <div>
            <!-- Вкладки -->
            <div class="tabs">
              <button
                  v-for="(tab, index) in tabs"
                  :key="index"
                  class="tab"
                  :class="{ active: activeTab === index }"
                  @click="activeTab = index"
              >
                {{ tab.name }}
              </button>
            </div>

            <!-- Контент активного таба -->
            <div v-if="activeTab === 0" class="tab-content">

              <div class="section-settings">
                <label>
                  <input type="number" v-model.number="config.maxOpenTrades" />
                  <span class="name">Ограничение открытых позиций (осталось {{ remainingBuyLimits }})</span>
                </label>

                <div>
                  <label>
                    <input type="number" v-model.number="config.priceStart" step="0.1" />
                    <span class="name">Начальная цена</span>
                  </label>

                  <label>
                    <input type="number" v-model.number="config.gridStep" step="0.1" />
                    <span class="name">Шаг сетки, пункты</span>
                  </label>

                  <label>
                    <input type="number" v-model.number="config.takeProfitDistance" step="0.1" />
                    <span class="name">Тейк-профит, пункты</span>
                  </label>


                  <label>
                    <input type="number" v-model.number="config.levelsCount" />
                    <span class="name">Число лимиток, шт</span>
                  </label>
                  <label>
                    <input type="number" v-model.number="config.volume" />
                    <span class="name">Объём позиций</span>
                  </label>
                </div>


                <label>
                  <input type="number" v-model.number="config.volatility" step="0.1" />
                  <span class="name">Волатильность</span>
                </label>

                <label>
                  <input type="number" v-model.number="config.interval" />
                  <span class="name">Интервал (ms)</span>
                </label>

                <label>
                  <input type="checkbox" v-model="config.enableRestore" />
                  <span class="name">Включить восстановление лимиток</span>
                </label>
                <label>
                  <input type="number" v-model.number="config.restoreCount" min="1" />
                  <span class="name">Количество восстанавливаемых лимиток</span>
                </label>

                <label>
                  <input type="checkbox" v-model="config.enableGridShift" />
                  <span class="name">Включить смещение сетки</span>
                </label>

                <!--        <label>
                          <input type="number" v-model.number="config.gridShiftInterval" min="1000" />
                          <span class="name">Интервал смещения сетки (ms)</span>
                        </label>-->

                <label>
                  <input type="checkbox" v-model="config.enableTpShift" />
                  <span class="name">Включить смещение тейк-профитов</span>
                </label>

              </div>

              <div style="padding-top: 12px;">
                <button class="btn" @click="applySettings">Применить</button>
              </div>

            </div>

            <div v-if="activeTab === 1" class="chart">
              <!-- График -->
              <div>
                <button class="btn" @click="startSimulation">Старт</button>
                <button class="btn" @click="stopSimulation">Стоп</button>
              </div>
              <strong>Текущая цена:</strong> {{ currentPriceStr }}
              <canvas ref="chartCanvas" width="600" height="300"></canvas>
            </div>

            <div v-if="activeTab === 2" class="orders">
              <!-- Таблица ордеров -->
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
                    <div v-for="bo in state.buyLevels" :key="bo.price">
                      @{{ bo.price.toFixed(2) }} x {{ bo.volume }}
                    </div>
                  </td>
                  <td>
                    <div v-for="so in state.profitLevels" :key="so.price">
                      @{{ so.price.toFixed(2) }} x {{ so.volume }}
                    </div>
                  </td>
                  <td>
                    <div v-for="(ot, idx) in state.openTrades" :key="idx">
                      BUY@{{ ot.buyPrice.toFixed(2) }}, TP@{{ ot.takeProfit.toFixed(2) }},
                      vol={{ ot.volume }}
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <div v-if="activeTab === 3" class="history">
              <!-- История закрытых сделок -->
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

            <div v-if="activeTab === 4" class="log">
              <div>
                Осталось лимиток для восстановления: {{ state.remainingRestoreCount }}
              </div>
              <div class="log" ref="logBox">
                <pre>{{ logText }}</pre>
              </div>
            </div>
      </div>

</div>
</template>


<script>
import { ref, onMounted, reactive, computed, markRaw, toRaw, watch, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "MeshbotTemplate",

  setup() {
    // ========== РЕАКТИВНЫЕ ДАННЫЕ ==========

    const config = reactive({
      priceStart: 100,
      gridStep: 2,
      levelsCount: 3,
      volume: 10,
      takeProfitDistance: 1,
      volatility: 1,
      interval: 10,
      enableRestore: true,
      restoreCount: 300,
      enableGridShift: true, // Включение смещения сетки
      //gridShiftInterval: 5000, // Интервал смещения сетки
      gridShiftIntervals: [2000, 3000, 7000],

      // Новый флаг, чтобы смещать / не смещать TP у открытых сделок
      enableTpShift: false,
      maxOpenTrades: 10,
    });


    const state = reactive({
      remainingRestoreCount: 0,
      currentPrice: 100,
      simulationId: null,
      timeIndex: 0,

      buyLevels: [],
      profitLevels: [],
      openTrades: [],
      closedTrades: [],
      totalProfit: 0,

      priceData: [],
      linesData: [],

      // Точки входа/выхода для графика
      buyPoints: [],
      sellPoints: [],
    });

    const tabs = [
      { name: "Настройки" },
      { name: "График" },
      { name: "Ордера / Сделки" },
      { name: "История сделок" },
      { name: "Лог" },
    ];
    const activeTab = ref(0);

    // Для вывода лога
    const logText = ref("");

    // Ссылки на DOM
    const chartCanvas = ref(null);
    const logBox = ref(null);

    let chartInstance = null;

    // ========== COMPUTED ==========
    const currentPriceStr = computed(() => state.currentPrice.toFixed(2));

    const remainingBuyLimits = computed(() => {
      return Math.max(config.maxOpenTrades - state.openTrades.length, 0);
    });

    // ========== МЕТОДЫ ==========

    function log(msg) {
      logText.value += msg + "\n";
      if (logBox.value) {
        logBox.value.scrollTop = logBox.value.scrollHeight;
      }
    }

    let gridShiftTimer = null;

    function shiftGrid() {
      if (!config.enableGridShift) return;

      log("Смещаем сетку в соответствии с текущей ценой...");

      const oldPriceStart = config.priceStart;
      config.priceStart = state.currentPrice;

      // Если включено смещение TP, смещаем TP у открытых сделок
      if (config.enableTpShift) {
        const shiftValue = config.priceStart - oldPriceStart;
        for (const ot of state.openTrades) {
          // Не меняем ot.buyPrice
          ot.takeProfit += shiftValue;
        }
      }

      // 1) Перестраиваем BUY-ордера вокруг новой priceStart
      state.buyLevels = [];
      state.linesData = state.linesData.filter(line => !line.id.startsWith("BUY_"));

      for (let i = 1; i <= config.levelsCount; i++) {
        if (isPositionLimitReached()) {
          log("Превышен лимит позиций и лимиток. Новые лимитки не будут выставлены.");
          break;
        }
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

      // 2) Пересоздаём SELL-ордера для (уже) открытых сделок
      state.linesData = state.linesData.filter(line => !line.id.startsWith("SELL_"));
      state.profitLevels = [];

      for (const ot of state.openTrades) {
        const so = {
          price: ot.takeProfit,
          volume: ot.volume,
          linkBuy: ot.buyPrice,
        };
        state.profitLevels.push(so);
        state.linesData.push({
          id: "SELL_" + so.price,
          price: so.price,
          color: "red",
        });
      }

      updateChart();

      // 3) Выбираем случайный интервал до следующего смещения
      if (config.enableGridShift) {
        const randomInterval = config.gridShiftIntervals[
            Math.floor(Math.random() * config.gridShiftIntervals.length)
            ];
        gridShiftTimer = setTimeout(shiftGrid, randomInterval);
        log(`Следующее смещение через ${randomInterval} мс`);
      }
    }

    watch(
        activeTab,
        (newTab) => {
          if (newTab === 1) {
            // Если переходим на вкладку "График", создаём график
            nextTick(() => {
              if (!chartInstance) {
                initChartInstance();
                updateChart();
              }
            });
          } else {
            // Если уходим с вкладки "График", уничтожаем график
            destroyChartInstance();
          }
        },
        { immediate: true }
    );


    function isPositionLimitReached() {
      return state.openTrades.length + state.buyLevels.length >= config.maxOpenTrades;
    }

    function startSimulation() {
      if (state.simulationId) {
        log("Симуляция уже идёт!");
        return;
      }
      log("=== START ===");
      resetState();

      state.simulationId = setInterval(simulate, config.interval);

      if (config.enableGridShift) {
        shiftGrid();
      }
    }

    function stopSimulation() {
      if (!state.simulationId) {
        log("Симуляция не запущена!");
        return;
      }
      clearInterval(state.simulationId);
      state.simulationId = null;

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
        interval: config.interval,
      }));
      state.remainingRestoreCount = config.restoreCount;
      resetState();
    }

    function resetState() {
      state.currentPrice = config.priceStart;
      state.timeIndex = 0;

      state.buyLevels = [];
      state.profitLevels = [];
      state.openTrades = [];
      state.closedTrades = [];
      state.totalProfit = 0;

      state.priceData = [];
      state.linesData = [];
      state.buyPoints = [];
      state.sellPoints = [];

      initBuyOrders();
      state.priceData.push({ x: 0, y: state.currentPrice });
      updateChart();
    }

    function initBuyOrders() {
      state.buyLevels = []; // Сброс существующих уровней
      for (let i = 1; i <= config.levelsCount; i++) {
        if (isPositionLimitReached()) {
          log("Превышен лимит позиций и лимиток. Новые лимитки не будут выставлены.");
          break;
        }
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
    }

    function simulate() {
      state.timeIndex++;
      const delta = Math.random() * (config.volatility * 2) - config.volatility;
      state.currentPrice += delta;
      if (state.currentPrice < 0) state.currentPrice = 0.1;

      state.priceData.push({ x: state.timeIndex, y: state.currentPrice });

      checkBuyOrders();
      checkprofitLevels();

      updateChart();
    }

    function checkBuyOrders() {
      for (let i = 0; i < state.buyLevels.length; i++) {
        const bo = state.buyLevels[i];
        if (state.currentPrice <= bo.price) {
          if (state.openTrades.length >= config.maxOpenTrades) {
            log(`Лимит открытых позиций достигнут: ${config.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }

          log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);
          state.buyLevels.splice(i, 1);
          i--;
          removeLine("BUY_" + bo.price);

          state.buyPoints.push({ x: state.timeIndex, y: bo.price });

          const trade = {
            buyPrice: bo.price,
            volume: bo.volume,
            takeProfit: bo.price + config.takeProfitDistance,
          };
          state.openTrades.push(trade);

          const so = {
            price: trade.takeProfit,
            volume: trade.volume,
            linkBuy: trade.buyPrice,
          };
          state.profitLevels.push(so);

          state.linesData.push({
            id: "SELL_" + so.price,
            price: so.price,
            color: "red",
          });
        }
      }
    }


    function checkprofitLevels() {
      for (let j = 0; j < state.profitLevels.length; j++) {
        const so = state.profitLevels[j];
        if (state.currentPrice >= so.price) {
          log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);
          state.profitLevels.splice(j, 1);
          j--;
          removeLine("SELL_" + so.price);

          state.sellPoints.push({ x: state.timeIndex, y: so.price });

          const idx = state.openTrades.findIndex(
              t => t.buyPrice === so.linkBuy
          );
          if (idx >= 0) {
            const tr = state.openTrades[idx];
            // Считаем профит классической формулой (цена продажи - цена покупки)*volume
            const profit = (so.price - tr.buyPrice) * tr.volume;
            state.totalProfit += profit;
            state.closedTrades.push({
              buyPrice: tr.buyPrice,
              sellPrice: so.price,
              volume: tr.volume,
              profit,
            });
            state.openTrades.splice(idx, 1);

            // Восстановление лимитки (если включено)
            if (config.enableRestore && state.remainingRestoreCount > 0) {
              if (isPositionLimitReached()) {
                log("Превышен лимит позиций и лимиток. Восстановление отменено.");
                return;
              }
              state.buyLevels.push({
                price: tr.buyPrice,
                volume: config.volume,
              });
              state.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "green",
              });
              state.remainingRestoreCount--;
              log(
                  `Restored BUY limit @${tr.buyPrice.toFixed(
                      2
                  )}. Remaining: ${state.remainingRestoreCount}`
              );
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
      if (!chartCanvas.value) {
        console.error("Canvas not found. Chart initialization skipped.");
        return;
      }
      const ctx = chartCanvas.value.getContext("2d");
      chartInstance = markRaw(
          new Chart(ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Price",
                  data: [],
                  borderColor: "blue",
                  pointRadius: 0,
                  borderWidth: 1,
                  backgroundColor: "rgba(0,0,255,0.1)",
                  fill: true,
                },
                {
                  label: "Lines",
                  data: [],
                  borderColor: "#921eff",
                  borderDash: [5, 3],
                  borderWidth: 1,
                  showLine: true,
                  pointRadius: 0,
                  fill: false,
                  spanGaps: false,
                },
                {
                  label: "Buy Points",
                  data: [],
                  showLine: false,
                  pointStyle: "triangle",
                  pointRadius: 2,
                  borderColor: "green",
                  backgroundColor: "green",
                },
                {
                  label: "Sell Points",
                  data: [],
                  showLine: false,
                  pointStyle: "rect",
                  pointRadius: 2,
                  borderColor: "red",
                  backgroundColor: "red",
                },

                {
                  label: "Vertical Trades",
                  data: [],
                  showLine: true,       // рисуем линию между точками
                  pointRadius: 0,       // убираем точки
                  borderDash: [],       // хотим сплошную линию
                  borderWidth: 1,
                  fill: false,
                  spanGaps: false,
                }
              ],
            },
            options: {
              animation: false,
              scales: {
                x: {
                  type: "linear",
                  position: "bottom",
                  grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                  },
                },
                y: {
                  beginAtZero: false,
                  grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                  },
                },
              },
            },
          })
      );
    }

    function updateChart() {
      if (!chartInstance) return;

      // 1. Берём «сырые» данные цены.
      const rawPriceData = toRaw(state.priceData);
      chartInstance.data.datasets[0].data = rawPriceData;

      // 2. Получаем диапазон y (минимум и максимум).
      const allPrices = rawPriceData.map(p => p.y);

      // Если вдруг массив цен пуст (или что-то аналогичное),
      // нужно предусмотреть защиту от ошибки:
      if (!allPrices.length) {
        chartInstance.update();
        return;
      }

      // 3. Объявляем yMin и yMax:
      const yMin = Math.min(...allPrices) - 1;
      const yMax = Math.max(...allPrices) + 1;

      // Дальше продолжаем логику, связанную с вертикальными линиями:
      // (примерно как в предыдущем сообщении)

      const verticalTrades = [];

      // Отображение линий с разными цветами
      const rawLines = toRaw(state.linesData);
      const linesPoints = [];
      for (const line of rawLines) {
        linesPoints.push({ x: 0, y: line.price, customColor: line.color });
        linesPoints.push({
          x: state.timeIndex + 5,
          y: line.price,
          customColor: line.color,
        });
        linesPoints.push({ x: null, y: null });
      }

      chartInstance.data.datasets[1].data = linesPoints;

      // Привязываем цвет каждой линии к её значению
      chartInstance.data.datasets[1].segment = {
        borderColor: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customColor || "#921eff";
        },
      };

      // Пробегаемся по buyPoints
      for (const bp of toRaw(state.buyPoints)) {
        verticalTrades.push({
          x: bp.x,
          y: yMin,
          customColor: "green",
        });
        verticalTrades.push({
          x: bp.x,
          y: yMax,
          customColor: "green",
        });
        verticalTrades.push({ x: null, y: null });
      }

      // Пробегаемся по sellPoints
      for (const sp of toRaw(state.sellPoints)) {
        verticalTrades.push({
          x: sp.x,
          y: yMin,
          customColor: "red",
        });
        verticalTrades.push({
          x: sp.x,
          y: yMax,
          customColor: "red",
        });
        verticalTrades.push({ x: null, y: null });
      }

      // Допустим, вертикальные линии кладём в datasets[2].
      chartInstance.data.datasets[4].data = verticalTrades;
      chartInstance.data.datasets[4].segment = {
        borderColor: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customColor || "gray";
        },
      };

      // Если надо, обнуляем старые точки (dataset[3]).
      chartInstance.data.datasets[3].data = [];

      chartInstance.update();
    }

    function destroyChartInstance() {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    }


    onMounted(() => {
      initChartInstance();
      resetState();
    });

    return {
      config,
      state,
      logText,
      currentPriceStr,
      remainingBuyLimits,
      chartCanvas,
      logBox,
      applySettings,
      startSimulation,
      stopSimulation,
      tabs,
      activeTab,
    };
  },
};
</script>

<style scoped>
.mesh-bot {
  max-width: 700px;
  margin: 0 auto;
}

.section {
  background: #242737;
  border: 1px solid #404562;
  padding: 10px;
  margin-bottom: 10px;
}

.section-settings{

}
.section-settings .name{
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 50px;
  box-sizing: border-box;
}
.section-settings label{
  position: relative;
  display: block;
  padding: 4px 0 6px 0;
}
.section-settings input{
  position: absolute;
  left: 0;
}
.section-settings input[type=number]{
  width: 40px;
}
.log {
  background: #242737;
  height: 120px;
  overflow-y: auto;
  border: 1px solid #404562;
  margin-top: 10px;
}

.tabs {
  display: flex;
  background-color: #333;
  border-bottom: 2px solid #404562;
}

.tab {
  flex: 1;
  padding: 10px 20px;
  text-align: center;
  cursor: pointer;
  background-color: #242737;
  color: white;
  border: none;
  outline: none;
  transition: background-color 0.3s;
}

.tab:hover {
  background-color: #404562;
}

.tab.active {
  background-color: #1d202b;
  font-weight: bold;
  border-bottom: 2px solid #4caf50;
}

.tab-content {
  padding: 20px;
  background-color: #242737;
  border: 1px solid #404562;
  margin-top: 10px;
}

</style>
