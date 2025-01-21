<template>
  <div class="meshbot-simulator">

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleBlock('block1')">
        <h2 class="title">
          <i  v-if="visibilityState['block1']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Параметры бота "Шаблон 1"
        </h2>
      </div>

      <div class="section-settings" v-show="visibilityState.block1">
        <div class="settings-grid">

          <div class="settings-block">
            Риск
            <label>
              <input type="number" v-model.number="simulationStore.maxOpenTrades" />
              <span class="name">Лимит открытых позиций<br/> (осталось {{ remainingBuyLimits }})</span>
            </label>

            <label>
              <input type="number" v-model.number="simulationStore.volume" />
              <span class="name">Объём позиций</span>
            </label>
          </div>

          <div class="settings-block">
            Сетка
            <label>
              <input type="number" v-model.number="simulationStore.levelsCount" />
              <span class="name">Число лимиток в пакете, шт</span>
            </label>

            <label>
              <input type="number" v-model.number="simulationStore.gridStep" step="0.1" />
              <span class="name">Шаг сетки, пункты</span>
            </label>

            <label>
              <input type="number" v-model.number="simulationStore.takeProfitDistance" step="0.1" />
              <span class="name">Тейк, пункты</span>
            </label>
          </div>

          <div class="settings-block">
            Улучшение сетки
            <label>
              <input type="checkbox" v-model="simulationStore.enableRestore" />
              <span class="name">Включить восстановление лимиток</span>
            </label>

            <label>
              <input type="number" v-model.number="simulationStore.restoreCount" min="1" />
              <span class="name">Число восстанавливаемых лимиток</span>
            </label>

            <label>
              <input type="checkbox" v-model="simulationStore.enableGridShift" />
              <span class="name">Включить смещение сетки</span>
            </label>

            <label>
              <input type="checkbox" v-model="simulationStore.enableTpShift" />
              <span class="name">Включить смещение тейка</span>
            </label>
          </div>

        </div>
      </div>
    </div>

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleBlock('block2')">
        <h2 class="title">
          <i v-if="visibilityState['block2']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Генератор данных
        </h2>
      </div>

      <div v-show="visibilityState['block2']">
        <div class="settings-items">
          <div class="item">
            <div style="margin: 0 0 8px;">
              Режим отображения графика:
            </div>
            <select v-model="displayMode" style="margin: 0 0 12px; display: block;">
              <option value="all">Все данные</option>
              <option value="latest">Последние данные</option>
            </select>

            <label v-if="displayMode === 'latest'">
              Количество последних данных:
              <input type="number" v-model.number="latestWindowSize" />
            </label>
          </div>

          <div class="item">
            Стартовая цена:
            <input type="number" v-model.number="simulationStore.initialPrice" step="1" @change="resetState()"/>

            <p>Текущая цена: {{ simulationStore.currentPrice }}</p>

<!--            <div>
              <span class="name">Множитель волатильности (>1)</span>
              <input type="number" v-model.number="simulationStore.priceStepMultiplier" step="0.1" min="1" />
            </div>-->
          </div>

          <div class="item">
            <span class="name">Волатильность</span>
            <input type="number" v-model.number="simulationStore.volatility" step="0.1" />
          </div>

          <div class="item">
            <span class="name">Период тиков (ms)</span>
            <input type="number" v-model.number="simulationStore.interval" />
          </div>
        </div>
      </div>
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block3')">
        <h2 class="title">
          <i v-if="visibilityState['block3']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Симуляция торговли
        </h2>
      </div>

      <div v-show="visibilityState.block3">
        <div class="mesh-simulation-buttons" style="position: relative;">
          <button class="btn" @click="!inProgress ? startSimulation() : stopSimulation()">
            <i class="fal" :class="{'fa-pause': inProgress, 'fa-play': !inProgress}"></i>
          </button>
          <button class="btn" @click="resetState()">
            <i class="fal fa-repeat"></i>
          </button>

          <div style="position: absolute; right: 10px; top: 20px;">
            <strong>Прибыль:</strong> {{ simulationStore.totalProfit.toFixed(2) }}
          </div>
        </div>

        <div class="chart">
          <canvas ref="chartCanvas" width="600" height="300"></canvas>
        </div>
      </div>
    </div>


    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block4')">
        <h2 class="title">
          <i v-if="visibilityState['block4']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Активные позиции
        </h2>
      </div>

        <OrdersComponent
            v-if="visibilityState['block4']"
            :buyLevels="simulationStore.buyLevels"
            :sellOrders="simulationStore.sellOrders"
            :openTrades="simulationStore.openTrades"
        />
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block5')">
        <h2 class="title">
          <i v-if="visibilityState['block5']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          История сделок
        </h2>
      </div>
      <HistoryComponent
          v-if="visibilityState['block5']"
          :closedTrades="simulationStore.closedTrades"
          :totalProfit="simulationStore.totalProfit"
      />
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block6')">
        <h2 class="title">
          <i v-if="visibilityState['block6']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Логи бота
        </h2>
      </div>
      <LogComponent
          v-if="visibilityState['block6']"
          :logText="logText"
          :remainingRestoreCount="simulationStore.remainingRestoreCount"
      />
    </div>

  </div>
</template>

<script>
import OrdersComponent from "@/widgets/MeshBot/components/OrdersComponent.vue";
import HistoryComponent from "@/widgets/MeshBot/components/HistoryComponent.vue";
import LogComponent from "@/widgets/MeshBot/components/LogComponent.vue";

import { markRaw, toRaw } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

import zoomPlugin from 'chartjs-plugin-zoom';
import {useSimulationStore} from "@/stores/simulationStore";
Chart.register(zoomPlugin);


export default {
  name: "SimulationComponent",
  components: { OrdersComponent, HistoryComponent, LogComponent },

  setup() {

    //const meshStore = useMeshStore(); // Инициализация хранилища
    const simulationStore = useSimulationStore();

    const setInitialPrice = () => {
      simulationStore.setInitialPrice(simulationStore.initialPrice);
    };

    return {
      simulationStore,
      setInitialPrice,
    }
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

  data() {
    return {

      visibilityState: {
        block1: true,
        block2: true,
        block3: true,
        block4: true,
        block5: true,
        block6: true,
        block7: true,
      },

      forwardPadding: 10,

      displayMode: "all", // Режим отображения графика
      latestWindowSize: 100,

      inProgress: false,

      /*config:{
        priceStep: 1,
        priceStepMultiplier: 10,

        gridStep: 20,
        takeProfitDistance: 20,

        levelsCount: 3,
        volume: 10,

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
      },*/

      /*simulationStore:{
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
      },*/


      logText: "",

      //chartCanvas: null,
      logBox: null,

      chartInstance: null,

      gridShiftTimer: null,

    };
  },

  methods: {

    toggleBlock(blockId) {
      this.visibilityState[blockId] = !this.visibilityState[blockId];
    },

    roundToStep(value, step) {
      return Math.floor(value / step + 0.5) * step;
    },

    updateChartSize() {
      if (this.chartInstance) {
        const canvas = this.$refs.chartCanvas;
        if (canvas) {
          canvas.width = canvas.parentElement.offsetWidth;
          canvas.height = canvas.parentElement.offsetHeight;
          this.chartInstance.resize();
        }
      }
    },

    checkSellOrders() {
      for (let j = 0; j < this.simulationStore.sellOrders.length; j++) {
        const so = this.simulationStore.sellOrders[j];
        if (this.simulationStore.currentPrice >= so.price) {
          this.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);
          this.simulationStore.sellOrders.splice(j, 1);
          j--;
          this.removeLine("SELL_" + so.price);

          this.simulationStore.sellPoints.push({ x: this.simulationStore.timeIndex, y: so.price });

          const idx = this.simulationStore.openTrades.findIndex(
              t => t.buyPrice === so.linkBuy
          );
          if (idx >= 0) {
            const tr = this.simulationStore.openTrades[idx];
            // Считаем профит классической формулой (цена продажи - цена покупки)*volume
            const profit = (so.price - tr.buyPrice) * tr.volume;
            this.simulationStore.totalProfit += profit;
            this.simulationStore.closedTrades.push({
              buyPrice: tr.buyPrice,
              sellPrice: so.price,
              volume: tr.volume,
              profit,
            });
            this.simulationStore.openTrades.splice(idx, 1);

            // Восстановление лимитки (если включено)
            if (this.simulationStore.enableRestore && this.simulationStore.remainingRestoreCount > 0) {
              if (this.isPositionLimitReached()) {
                this.log("Превышен лимит позиций и лимиток. Восстановление отменено.");
                return;
              }
              // Новая проверка: лимит лимиток
              if (this.simulationStore.buyLevels.length >= this.simulationStore.levelsCount) {
                this.log("Превышен лимит лимиток. Восстановление отменено.");
                continue;
              }

              this.simulationStore.buyLevels.push({
                price: tr.buyPrice,
                volume: this.simulationStore.volume,
              });
              this.simulationStore.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "rgba(255,183,77,0.7)",
              });
              this.simulationStore.remainingRestoreCount--;
              this.log(
                  `Restored BUY limit @${tr.buyPrice.toFixed(
                      2
                  )}. Remaining: ${this.simulationStore.remainingRestoreCount}`
              );
            }
          }
        }
      }
    },

    removeLine(id) {
      const idx = this.simulationStore.linesData.findIndex(l => l.id === id);
      if (idx >= 0) {
        this.simulationStore.linesData.splice(idx, 1);
      }
    },

    updateChart() {

      if (!this.chartInstance) return;

      const rawPriceData = toRaw(this.simulationStore.priceData);
      const rawLines = toRaw(this.simulationStore.linesData);
      //const allPrices = rawPriceData.map(p => p.y);
      const buyPrices = this.simulationStore.buyLevels.map(level => level.price);
      const sellPrices = this.simulationStore.sellOrders.map(order => order.price);

      // Применяем фильтр в зависимости от режима
      let filteredPriceData;
      if (this.displayMode === "latest") {
        filteredPriceData = rawPriceData.slice(-this.latestWindowSize);
      } else {
        filteredPriceData = rawPriceData;
      }

      //console.log('Filtered price data', rawPriceData);

      this.chartInstance.data.datasets[0].data = filteredPriceData;//rawPriceData;

      // Устанавливаем границы оси X
      //const rightPadding = this.latestWindowSize/10;
      const xMin = filteredPriceData.length > 0 ? filteredPriceData[0].x : 0;
      const xMax = filteredPriceData.length > 0 ? filteredPriceData[filteredPriceData.length - 1].x  : 0;

      this.chartInstance.options.scales.x.min = xMin;
      this.chartInstance.options.scales.x.max = xMax;

      const visibleYValues = [
        ...filteredPriceData.map(p => p.y), // Видимые цены
        ...rawLines.map(line => line.price), // Цены лимиток (линии)
        ...buyPrices, // Цены buy-лимиток
        ...sellPrices, // Цены sell-лимиток
      ].filter(value => value !== undefined); // Исключаем возможные undefined


      // Расчёт минимального и максимального значения Y
      const yMin = Math.min(...visibleYValues) - 1; // Padding в 1 пункт
      const yMax = Math.max(...visibleYValues) + 1;

      this.chartInstance.options.scales.y.min = yMin;
      this.chartInstance.options.scales.y.max = yMax;

      const verticalTrades = [];

      //console.log("LinesData:", this.simulationStore.linesData);

      // Отображение линий с разными цветами
      const linesPoints = [];
      for (const line of rawLines) {
        linesPoints.push({ x: 0, y: line.price, customColor: line.color });
        linesPoints.push({
          x: this.simulationStore.timeIndex + 5,
          y: line.price,
          customColor: line.color,
        });
        linesPoints.push({ x: null, y: null });
      }

      // Добавляем линию текущей цены
      linesPoints.push({ x: 0, y: this.simulationStore.currentPrice, customColor: "white" });
      linesPoints.push({
        x: this.simulationStore.timeIndex + 5,
        y: this.simulationStore.currentPrice,
        customColor: "white",
      });
      linesPoints.push({ x: null, y: null });


      this.chartInstance.data.datasets[1].data = linesPoints;

      // Привязываем цвет каждой линии к её значению
      this.chartInstance.data.datasets[1].segment = {
        borderColor: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customColor || "rgba(146,30,255,0.7)";
        },
      };

      // Пробегаемся по buyPoints
      for (const bp of toRaw(this.simulationStore.buyPoints)) {
        verticalTrades.push({
          x: bp.x,
          y: yMin,
          customColor: "rgba(255,183,77,0.7)",
          //customDash: [2, 2],
        });
        verticalTrades.push({
          x: bp.x,
          y: yMax,
          customColor: "rgba(255,183,77,0.7)",
          //customDash: [2, 2],
        });
        verticalTrades.push({ x: null, y: null });
      }

      // Пробегаемся по sellPoints
      for (const sp of toRaw(this.simulationStore.sellPoints)) {
        verticalTrades.push({
          x: sp.x,
          y: yMin,
          customColor: "#9B67DB",
          //customDash: [2, 2],
        });
        verticalTrades.push({
          x: sp.x,
          y: yMax,
          customColor: "#9B67DB",
          //customDash: [2, 2],
        });
        verticalTrades.push({ x: null, y: null });
      }

      this.chartInstance.data.datasets[4].data = verticalTrades;
      this.chartInstance.data.datasets[4].segment = {
        borderColor: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customColor || "gray";
        },
        borderDash: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customDash || [0]; // Стиль линии (по умолчанию сплошная)
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
      if (!this.simulationStore.enableGridShift) return;

      this.log("Смещаем сетку в соответствии с текущей ценой...");

      const oldPriceStart = this.simulationStore.priceStart;
      this.simulationStore.priceStart = this.simulationStore.currentPrice;

      // Если включено смещение TP, смещаем TP у открытых сделок
      if (this.simulationStore.enableTpShift) {
        const shiftValue = this.simulationStore.priceStart - oldPriceStart;
        for (const ot of this.simulationStore.openTrades) {
          // Не меняем ot.buyPrice
          ot.takeProfit += shiftValue;
        }
      }

      // 1) Перестраиваем BUY-ордера вокруг новой priceStart
      this.simulationStore.buyLevels = [];
      this.simulationStore.linesData = this.simulationStore.linesData.filter(line => !line.id.startsWith("BUY_"));

      for (let i = 1; i <= this.simulationStore.levelsCount; i++) {

        if (this.simulationStore.buyLevels.length >= this.simulationStore.levelsCount) {
          this.log("Превышен лимит лимиток. Новые лимитки не будут выставлены.");
          break;
        }

        if (this.isPositionLimitReached()) {
          this.log("Превышен лимит позиций. Новые лимитки не будут выставлены.");
          break;
        }
        const levelPrice = this.roundToStep(this.simulationStore.priceStart - i * this.simulationStore.gridStep, this.simulationStore.priceStep);
        this.simulationStore.buyLevels.push({
          price: levelPrice,
          volume: this.simulationStore.volume,
        });
        this.simulationStore.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "rgba(255,183,77,0.7)",
        });
      }

      // 2) Пересоздаём SELL-ордера для (уже) открытых сделок
      this.simulationStore.linesData = this.simulationStore.linesData.filter(line => !line.id.startsWith("SELL_"));
      this.simulationStore.sellOrders = [];

      for (const ot of this.simulationStore.openTrades) {
        const so = {
          price: ot.takeProfit,
          volume: ot.volume,
          linkBuy: ot.buyPrice,
        };
        this.simulationStore.sellOrders.push(so);
        this.simulationStore.linesData.push({
          id: "SELL_" + so.price,
          price: so.price,
          color: "#9B67DB",
        });
      }

      this.updateChart();

      // 3) Выбираем случайный интервал до следующего смещения
      if (this.simulationStore.enableGridShift) {
        const randomInterval = this.simulationStore.gridShiftIntervals[
            Math.floor(Math.random() * this.simulationStore.gridShiftIntervals.length)
            ];
        this.gridShiftTimer = setTimeout(this.shiftGrid, randomInterval);
        this.log(`Следующее смещение через ${randomInterval} мс`);
      }
    },

    isPositionLimitReached() {
      return this.simulationStore.openTrades.length + this.simulationStore.buyLevels.length >= this.simulationStore.maxOpenTrades;
    },

    startSimulation() {
      if (this.simulationStore.simulationId) {
        this.log("Симуляция уже идёт!");
        return;
      }
      this.log("=== START ===");

      this.inProgress = true;

      this.simulationStore.simulationId = setInterval(this.simulate, this.simulationStore.interval);

      if (this.simulationStore.enableGridShift) {
        this.shiftGrid();
      }
    },

    stopSimulation() {
      if (!this.simulationStore.simulationId) {
        this.log("Симуляция не запущена!");
        return;
      }

      this.inProgress = false;

      clearInterval(this.simulationStore.simulationId);
      this.simulationStore.simulationId = null;

      if (this.gridShiftTimer) {
        clearTimeout(this.gridShiftTimer);
        this.gridShiftTimer = null;
      }

      this.log("=== STOP ===");
    },

    applySettings() {
      this.log("Применили настройки: " + JSON.stringify({
        priceStart: this.simulationStore.priceStart,
        gridStep: this.simulationStore.gridStep,
        levelsCount: this.simulationStore.levelsCount,
        volume: this.simulationStore.volume,
        takeProfitDistance: this.simulationStore.takeProfitDistance,
        volatility: this.simulationStore.volatility,
        interval: this.simulationStore.interval,
      }));
      //this.resetState();
    },

    initBuyOrders() {

      console.log("Initializing buy orders...");

      if (!this.simulationStore.linesData) {
        this.simulationStore.linesData = []; // Инициализация, если не существует
      }

      this.simulationStore.buyLevels = []; // Сброс существующих уровней
      this.simulationStore.linesData = this.simulationStore.linesData.filter(line => !line.id.startsWith("BUY_"));

      for (let i = 1; i <= this.simulationStore.levelsCount; i++) {
        if (this.simulationStore.buyLevels.length >= this.simulationStore.levelsCount) {
          this.log("Превышен лимит лимиток. Новые лимитки не будут выставлены.");
          break;
        }
        if (this.isPositionLimitReached()) {
          this.log("Превышен лимит позиций. Новые позиции не будут выставлены.");
          break;
        }

        const levelPrice = this.simulationStore.currentPrice - i * this.simulationStore.gridStep;

        this.simulationStore.buyLevels.push({
          price: levelPrice,
          volume: this.simulationStore.volume,
        });

        // Выставляем лимитки до симуляции
        this.simulationStore.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "rgba(255,183,77,0.7)",
        });
      }

      //console.log("LinesData after initBuyOrders:", toRaw(this.simulationStore.linesData));

      this.updateChart();
      /*console.log("Buy levels:", this.simulationStore.buyLevels);
      console.log("Lines data:", this.simulationStore.linesData);*/
    },

    simulate() {
      this.simulationStore.timeIndex++;

      // Генерируем случайный множитель шага: положительный или отрицательный
      const multiplier = (Math.random() - 0.5) * 2 * this.simulationStore.priceStepMultiplier;
      //const multiplier = (Math.random() > 0.5 ? 1 : -1) * this.simulationStore.priceStepMultiplier;

      const newPrice = this.simulationStore.currentPrice + this.simulationStore.priceStep * multiplier;

      //this.simulationStore.currentPrice += delta;

      // Применяем минимальный шаг
      this.simulationStore.currentPrice = this.roundToStep(newPrice, this.simulationStore.priceStep);

      if (this.simulationStore.currentPrice < 0) this.simulationStore.currentPrice = 0.1;

      this.simulationStore.priceData.push({ x: this.simulationStore.timeIndex, y: this.simulationStore.currentPrice });

      this.checkBuyOrders();
      this.checkSellOrders();

      this.updateChart();
    },

    syncLinesDataWithBuyLevels() {
      // Сбрасываем существующие линии
      this.simulationStore.linesData = [];

      // Добавляем лимитки в linesData
      this.simulationStore.buyLevels.forEach(level => {
        this.simulationStore.linesData.push({
          id: "BUY_" + level.price,
          price: level.price,
          color: "rgba(255,183,77,0.7)",
        });
      });

      console.log("Lines synchronized:", this.simulationStore.linesData);
    },

    syncPriceDataWithBuyLevels() {
      // Добавляем стартовую цену как первый элемент
      const initialPricePoint = {
        x: 0, // Временная метка (может быть изменена)
        y: this.simulationStore.initialPrice,
      };

      // Объединяем стартовую цену и лимитки
      this.simulationStore.priceData = [
        initialPricePoint,
        ...this.simulationStore.buyLevels.map((level, index) => ({
          x: index + 1, // Смещение индекса для лимиток
          y: level.price,
        })),
      ];

      console.log("Synchronized priceData with initial price and buyLevels:", this.simulationStore.priceData);
    },

    checkBuyOrders() {
      for (let i = 0; i < this.simulationStore.buyLevels.length; i++) {
        const bo = this.simulationStore.buyLevels[i];
        if (this.simulationStore.currentPrice <= bo.price) {
          if (this.simulationStore.openTrades.length >= this.simulationStore.maxOpenTrades) {
            this.log(`Лимит открытых позиций достигнут: ${this.simulationStore.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }

          this.log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);
          this.simulationStore.buyLevels.splice(i, 1);
          i--;
          this.removeLine("BUY_" + bo.price);

          this.simulationStore.buyPoints.push({ x: this.simulationStore.timeIndex, y: bo.price });

          const trade = {
            buyPrice: bo.price,
            volume: bo.volume,
            takeProfit: bo.price + this.simulationStore.takeProfitDistance,
          };
          this.simulationStore.openTrades.push(trade);

          const so = {
            price: trade.takeProfit,
            volume: trade.volume,
            linkBuy: trade.buyPrice,
          };
          this.simulationStore.sellOrders.push(so);

          this.simulationStore.linesData.push({
            id: "SELL_" + so.price,
            price: so.price,
            color: "#9B67DB",
          });
        }
      }
    },

    resetState() {
      console.log("Сброс состояния вызван!");

      // Сохраняем текущую цену
      //const lastPrice = this.simulationStore.currentPrice || this.simulationStore.initialPrice || 10000;

      // Обнуляем данные, но оставляем текущую цену и активную симуляцию
      Object.assign(this.simulationStore, {
        timeIndex: 0,
        buyLevels: [],
        sellOrders: [],
        openTrades: [],
        closedTrades: [],
        totalProfit: 0,
        priceData: [],
        linesData: [],
        buyPoints: [],
        sellPoints: [],
        remainingRestoreCount: this.simulationStore.restoreCount,
      });

      // Устанавливаем начальную цену
      this.simulationStore.currentPrice = this.simulationStore.initialPrice;


      this.simulationStore.priceData.push(
          { x: 0, y: this.simulationStore.initialPrice },
          { x: 1, y: this.simulationStore.initialPrice }
      );

      // Добавляем начальную цену в данные графика
      /*this.simulationStore.priceData.push({
        x: 0,
        y: this.simulationStore.currentPrice,
      });*/

      // Инициализируем уровни лимиток
      this.initBuyOrders();
      //this.syncLinesDataWithBuyLevels();
      this.updateChart();

      /*if (!this.simulationStore.buyLevels.length) {
      this.initBuyOrders(); // Создаем уровни до симуляции
      this.syncPriceDataWithBuyLevels();
      this.updateChart();
      //this.updateChart();
    }*/

      // Обновляем график
      /*if (this.chartInstance) {
        this.chartInstance.data.datasets.forEach(dataset => {
          dataset.data = []; // Очищаем все данные графика
        });
        this.updateChart();
      }*/

      console.log("Состояние сброшено. Симуляция продолжается.");
    },

    initChartInstance() {

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
                  borderColor: "rgba(100,181,246,0.85)",
                  pointRadius: 0,
                  borderWidth: 1,
                  backgroundColor: "rgba(100,181,246,0.05)",
                  fill: true,
                },
                {
                  label: "Lines",
                  data: [],
                  borderColor: "rgba(146,30,255,0.7)",
                  borderDash: [5, 0],
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
                  //borderColor: "rgba(129,199,132,0.5)",
                  //backgroundColor: "rgba(129,199,132,0.5)",
                },
                {
                  label: "Sell Points",
                  data: [],
                  showLine: false,
                  pointStyle: "rect",
                  pointRadius: 2,
                  //borderColor: "rgba(229,115,115,0.5)",
                  //backgroundColor: "rgba(229,115,115,0.5)",
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
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                clip: {
                  left: true,
                  right: true,
                  top: true,
                  bottom: true,
                },
                legend: {
                  display: false, // Отключить легенду
                },
                /*zoom: {
                  pan: {
                    enabled: true,        // Включить панорамирование
                    mode: 'x',            // Панорамирование только по оси X
                    speed: 10,            // Скорость панорамирования
                    threshold: 5,         // Чувствительность к началу панорамирования
                  },
                  zoom: {
                    wheel: {
                      enabled: true,      // Включить масштабирование колесом мыши
                      speed: 0.1,         // Скорость масштабирования
                    },
                    pinch: {
                      enabled: true,      // Включить масштабирование пальцами на сенсорных устройствах
                    },
                    drag: {
                      enabled: false,     // Отключить масштабирование перетаскиванием
                    },
                    mode: 'x',            // Масштабирование только по оси X
                    overScaleMode: 'y',   // Предотвращение масштабирования за пределы Y
                    limits: {
                      x: { minRange: 1 }, // Минимальный диапазон масштабирования по оси X
                    },
                  },
                },*/

              },
              scales: {
                x: {
                  type: "linear",
                  position: "bottom",
                  grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                  },
                },
                y: {
                  beginAtZero: true,
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
    },
  },

  mounted(){
    this.initChartInstance();

    this.resetState();

    window.addEventListener("resize", this.updateChartSize);

  },

  unmounted() {
    this.destroyChartInstance();
    window.removeEventListener("resize", this.updateChartSize);
  },

  watch: {

    displayMode() {
      this.updateChart();
    },
    latestWindowSize() {
      if (this.displayMode === "latest") {
        this.updateChart();
      }
    },

    activeTab(newTab) {
      if (newTab === 0) {
        this.$nextTick(() => {
          if (!this.chartInstance) {
            this.initChartInstance();
          }
          if (this.chartInstance && this.simulationStore.priceData.length > 0) {
            this.updateChart();
          }
        });
      } else if (newTab !== 0 && this.chartInstance) {
        this.destroyChartInstance();
      }
    },
    config: {
      handler() {
        this.applySettings();
      },
      deep: true,
    },
  },

  computed: {
    currentPriceStr () {
      return this.simulationStore.currentPrice.toFixed(2);
    },
    remainingBuyLimits() {
      return Math.max(this.simulationStore.maxOpenTrades - this.simulationStore.openTrades.length, 0);
    },
  }
};
</script>

