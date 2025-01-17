<template>
  <div class="mesh-bot">

    <div>

      <TabsComponent
          :tabs="tabs"
          :activeTab="activeTab"
          @tab-click="activeTab = $event"
      />

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
        <OrdersComponent
            :buyLevels="state.buyLevels"
            :sellOrders="state.sellOrders"
            :openTrades="state.openTrades"
        />

      </div>

      <div v-if="activeTab === 3" class="history">
        <HistoryComponent
            :closedTrades="state.closedTrades"
            :totalProfit="state.totalProfit"
        />
      </div>

      <div v-if="activeTab === 4" class="log">
        <LogComponent
            :logText="logText"
            :remainingRestoreCount="state.remainingRestoreCount"
        />
      </div>

    </div>

  </div>
</template>


<script>
import LogComponent from "@/widgets/MeshBot/components/LogComponent.vue";
import TabsComponent from "@/widgets/MeshBot/components/TabsComponent.vue";
import OrdersComponent from "@/widgets/MeshBot/components/OrdersComponent.vue";
import HistoryComponent from "@/widgets/MeshBot/components/HistoryComponent.vue";

import { markRaw, toRaw } from "vue";
import { Chart, registerables } from "chart.js";
import webSocketService from "@/services/WebSocketService";
Chart.register(...registerables);

export default {
  name: "MeshBotTemplate",

  components: {
    LogComponent,
    TabsComponent,
    OrdersComponent,
    HistoryComponent,
  },

  data() { return {

    config:{
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
    },

    state:{
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

      // Точки входа/выхода для графика
      buyPoints: [],
      sellPoints: [],
    },

    activeTab: 0,

    tabs: [
      { name: "Настройки" },
      { name: "График" },
      { name: "Ордера / Сделки" },
      { name: "История сделок" },
      { name: "Лог" },
    ],

    logText: "",

    //chartCanvas: null,
    logBox: null,

    chartInstance: null,

    gridShiftTimer: null,

  }},

  methods: {

    checkSellOrders() {
    for (let j = 0; j < this.state.sellOrders.length; j++) {
      const so = this.state.sellOrders[j];
      if (this.state.currentPrice >= so.price) {
        this.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);
        this.state.sellOrders.splice(j, 1);
        j--;
        this.removeLine("SELL_" + so.price);

        this.state.sellPoints.push({ x: this.state.timeIndex, y: so.price });

        const idx = this.state.openTrades.findIndex(
            t => t.buyPrice === so.linkBuy
        );
        if (idx >= 0) {
          const tr = this.state.openTrades[idx];
          // Считаем профит классической формулой (цена продажи - цена покупки)*volume
          const profit = (so.price - tr.buyPrice) * tr.volume;
          this.state.totalProfit += profit;
          this.state.closedTrades.push({
            buyPrice: tr.buyPrice,
            sellPrice: so.price,
            volume: tr.volume,
            profit,
          });
          this.state.openTrades.splice(idx, 1);

          // Восстановление лимитки (если включено)
          if (this.config.enableRestore && this.state.remainingRestoreCount > 0) {
            if (this.isPositionLimitReached()) {
              this.log("Превышен лимит позиций и лимиток. Восстановление отменено.");
              return;
            }
            this.state.buyLevels.push({
              price: tr.buyPrice,
              volume: this.config.volume,
            });
            this.state.linesData.push({
              id: "BUY_" + tr.buyPrice,
              price: tr.buyPrice,
              color: "green",
            });
            this.state.remainingRestoreCount--;
            this.log(
                `Restored BUY limit @${tr.buyPrice.toFixed(
                    2
                )}. Remaining: ${this.state.remainingRestoreCount}`
            );
          }
        }
      }
    }
  },

  removeLine(id) {
    const idx = this.state.linesData.findIndex(l => l.id === id);
    if (idx >= 0) {
      this.state.linesData.splice(idx, 1);
    }
  },

  updateChart() {
    if (!this.chartInstance) return;

    // 1. Берём «сырые» данные цены.
    const rawPriceData = toRaw(this.state.priceData);
    this.chartInstance.data.datasets[0].data = rawPriceData;

    // 2. Получаем диапазон y (минимум и максимум).
    const allPrices = rawPriceData.map(p => p.y);

    // Если вдруг массив цен пуст (или что-то аналогичное),
    // нужно предусмотреть защиту от ошибки:
    if (!allPrices.length) {
      this.chartInstance.update();
      return;
    }

    // 3. Объявляем yMin и yMax:
    const yMin = Math.min(...allPrices) - 1;
    const yMax = Math.max(...allPrices) + 1;

    // Дальше продолжаем логику, связанную с вертикальными линиями:
    // (примерно как в предыдущем сообщении)

    const verticalTrades = [];

    // Отображение линий с разными цветами
    const rawLines = toRaw(this.state.linesData);
    const linesPoints = [];
    for (const line of rawLines) {
      linesPoints.push({ x: 0, y: line.price, customColor: line.color });
      linesPoints.push({
        x: this.state.timeIndex + 5,
        y: line.price,
        customColor: line.color,
      });
      linesPoints.push({ x: null, y: null });
    }

    this.chartInstance.data.datasets[1].data = linesPoints;

    // Привязываем цвет каждой линии к её значению
    this.chartInstance.data.datasets[1].segment = {
      borderColor: ctx => {
        const lineData = ctx.p1.raw;
        return lineData?.customColor || "#921eff";
      },
    };

    // Пробегаемся по buyPoints
    for (const bp of toRaw(this.state.buyPoints)) {
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
    for (const sp of toRaw(this.state.sellPoints)) {
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
    this.chartInstance.data.datasets[4].data = verticalTrades;
    this.chartInstance.data.datasets[4].segment = {
      borderColor: ctx => {
        const lineData = ctx.p1.raw;
        return lineData?.customColor || "gray";
      },
    };

    // Если надо, обнуляем старые точки (dataset[3]).
    this.chartInstance.data.datasets[3].data = [];

    this.chartInstance.update();
  },

  log(msg) {
    this.logText += msg + "\n";
    if (this.logBox) {
      this.logBox.scrollTop = this.logBox.scrollHeight;
    }
  },

  shiftGrid() {
    if (!this.config.enableGridShift) return;

    this.log("Смещаем сетку в соответствии с текущей ценой...");

    const oldPriceStart = this.config.priceStart;
    this.config.priceStart = this.state.currentPrice;

    // Если включено смещение TP, смещаем TP у открытых сделок
    if (this.config.enableTpShift) {
      const shiftValue = this.config.priceStart - oldPriceStart;
      for (const ot of this.state.openTrades) {
        // Не меняем ot.buyPrice
        ot.takeProfit += shiftValue;
      }
    }

    // 1) Перестраиваем BUY-ордера вокруг новой priceStart
    this.state.buyLevels = [];
    this.state.linesData = this.state.linesData.filter(line => !line.id.startsWith("BUY_"));

    for (let i = 1; i <= this.config.levelsCount; i++) {
      if (this.isPositionLimitReached()) {
        this.log("Превышен лимит позиций и лимиток. Новые лимитки не будут выставлены.");
        break;
      }
      const levelPrice = this.config.priceStart - i * this.config.gridStep;
      this.state.buyLevels.push({
        price: levelPrice,
        volume: this.config.volume,
      });
      this.state.linesData.push({
        id: "BUY_" + levelPrice,
        price: levelPrice,
        color: "green",
      });
    }

    // 2) Пересоздаём SELL-ордера для (уже) открытых сделок
    this.state.linesData = this.state.linesData.filter(line => !line.id.startsWith("SELL_"));
    this.state.sellOrders = [];

    for (const ot of this.state.openTrades) {
      const so = {
        price: ot.takeProfit,
        volume: ot.volume,
        linkBuy: ot.buyPrice,
      };
      this.state.sellOrders.push(so);
      this.state.linesData.push({
        id: "SELL_" + so.price,
        price: so.price,
        color: "red",
      });
    }

    this.updateChart();

    // 3) Выбираем случайный интервал до следующего смещения
    if (this.config.enableGridShift) {
      const randomInterval = this.config.gridShiftIntervals[
          Math.floor(Math.random() * this.config.gridShiftIntervals.length)
          ];
      this.gridShiftTimer = setTimeout(this.shiftGrid, randomInterval);
      this.log(`Следующее смещение через ${randomInterval} мс`);
    }
  },

  isPositionLimitReached() {
    return this.state.openTrades.length + this.state.buyLevels.length >= this.config.maxOpenTrades;
  },

  startSimulation() {
    if (this.state.simulationId) {
      this.log("Симуляция уже идёт!");
      return;
    }
    this.log("=== START ===");
    this.resetState();

    this.state.simulationId = setInterval(this.simulate, this.config.interval);

    if (this.config.enableGridShift) {
      this.shiftGrid();
    }
  },

  stopSimulation() {
    if (!this.state.simulationId) {
      this.log("Симуляция не запущена!");
      return;
    }
    clearInterval(this.state.simulationId);
    this.state.simulationId = null;

    if (this.gridShiftTimer) {
      clearTimeout(this.gridShiftTimer);
      this.gridShiftTimer = null;
    }

    this.log("=== STOP ===");
  },

  applySettings() {
    this.log("Применили настройки: " + JSON.stringify({
      priceStart: this.config.priceStart,
      gridStep: this.config.gridStep,
      levelsCount: this.config.levelsCount,
      volume: this.config.volume,
      takeProfitDistance: this.config.takeProfitDistance,
      volatility: this.config.volatility,
      interval: this.config.interval,
    }));
    this.state.remainingRestoreCount = this.config.restoreCount;
    this.resetState();
  },

  initBuyOrders() {
    this.state.buyLevels = []; // Сброс существующих уровней
    for (let i = 1; i <= this.config.levelsCount; i++) {
      if (this.isPositionLimitReached()) {
        this.log("Превышен лимит позиций и лимиток. Новые лимитки не будут выставлены.");
        break;
      }
      const levelPrice = this.config.priceStart - i * this.config.gridStep;
      this.state.buyLevels.push({
        price: levelPrice,
        volume: this.config.volume,
      });
      this.state.linesData.push({
        id: "BUY_" + levelPrice,
        price: levelPrice,
        color: "green",
      });
    }
  },

  simulate() {
    this.state.timeIndex++;
    const delta = Math.random() * (this.config.volatility * 2) - this.config.volatility;
    this.state.currentPrice += delta;
    if (this.state.currentPrice < 0) this.state.currentPrice = 0.1;

    this.state.priceData.push({ x: this.state.timeIndex, y: this.state.currentPrice });

    this.checkBuyOrders();
    this.checkSellOrders();

    this.updateChart();
  },

  checkBuyOrders() {
    for (let i = 0; i < this.state.buyLevels.length; i++) {
      const bo = this.state.buyLevels[i];
      if (this.state.currentPrice <= bo.price) {
        if (this.state.openTrades.length >= this.config.maxOpenTrades) {
          this.log(`Лимит открытых позиций достигнут: ${this.config.maxOpenTrades}`);
          return; // Останавливаем добавление новых сделок
        }

        this.log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);
        this.state.buyLevels.splice(i, 1);
        i--;
        this.removeLine("BUY_" + bo.price);

        this.state.buyPoints.push({ x: this.state.timeIndex, y: bo.price });

        const trade = {
          buyPrice: bo.price,
          volume: bo.volume,
          takeProfit: bo.price + this.config.takeProfitDistance,
        };
        this.state.openTrades.push(trade);

        const so = {
          price: trade.takeProfit,
          volume: trade.volume,
          linkBuy: trade.buyPrice,
        };
        this.state.sellOrders.push(so);

        this.state.linesData.push({
          id: "SELL_" + so.price,
          price: so.price,
          color: "red",
        });
      }
    }
  },

  resetState() {
      this.state.currentPrice = this.config.priceStart;
      this.state.timeIndex = 0;

      this.state.buyLevels = [];
      this.state.sellOrders = [];
      this.state.openTrades = [];
      this.state.closedTrades = [];
      this.state.totalProfit = 0;

      this.state.priceData = [];
      this.state.linesData = [];
      this.state.buyPoints = [];
      this.state.sellPoints = [];

      this.initBuyOrders();
      this.state.priceData.push({ x: 0, y: this.state.currentPrice });
      this.updateChart();
    },

    initChartInstance() {

      if(!this.$refs.chartCanvas) return;
      if (!this.$refs.chartCanvas) {
        console.error("Canvas not found. Chart initialization skipped.");
        return;
      }
      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chartInstance = markRaw(
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
    },

    destroyChartInstance() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    }
  },

  setup() {
    // ========== РЕАКТИВНЫЕ ДАННЫЕ ==========


    // ========== МЕТОДЫ ==========

    /*watch(
        activeTab,
        (newTab) => {
          if (newTab === 1) {
            // Если переходим на вкладку "График", создаём график
            nextTick(() => {
              if (!this.chartInstance) {
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
    );*/

  },

  mounted() {
    this.initChartInstance();
    this.resetState();
  },
  unmounted() {
    this.destroyChartInstance();
    webSocketService.close();
  },

  watch: {
    activeTab(newTab) {
      if (newTab === 1) {
        // Если переключились на вкладку "График"
        this.$nextTick(() => {
          if (!this.chartInstance) {
            this.initChartInstance();
            this.updateChart();
          }
        });
      } else {
        // Уничтожаем график при уходе с вкладки
        this.destroyChartInstance();
      }
    },
  },

  computed: {
    currentPriceStr () {
      return this.state.currentPrice.toFixed(2);
    },

    remainingBuyLimits() {
      return Math.max(this.config.maxOpenTrades - this.state.openTrades.length, 0);
    },

  },

};
</script>
