<template>
  <div class="meshbot-simulator">


    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleBlock('block1')">
        <h2 class="title">
          <i  v-if="visibilityState['block1']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Параметры реального бота SBER
        </h2>
      </div>
      <div class="section-settings" v-show="visibilityState.block1">
        <div class="settings-grid">

          <div class="settings-block">
            Риск
            <label>
              <input type="number" v-model.number="meshbotStore.maxOpenTrades" />
              <span class="name">Лимит открытых позиций<br/> (осталось {{ remainingBuyLimits }})</span>
            </label>

            <label>
              <input type="number" v-model.number="meshbotStore.volume" />
              <span class="name">Объём позиций</span>
            </label>
          </div>

          <div class="settings-block">
            Сетка
            <label>
              <input type="number" v-model.number="meshbotStore.levelsCount" />
              <span class="name">Число лимиток в пакете, шт</span>
            </label>

            <label>
              <input type="number" v-model.number="meshbotStore.gridStep" step="0.1" />
              <span class="name">Шаг сетки, пункты</span>
            </label>

            <label>
              <input type="number" v-model.number="meshbotStore.takeProfitDistance" step="0.1" />
              <span class="name">Тейк, пункты</span>
            </label>
          </div>

          <div class="settings-block">
            Улучшение сетки
            <label>
              <input type="checkbox" v-model="meshbotStore.enableRestore" />
              <span class="name">Включить восстановление лимиток</span>
            </label>

            <label>
              <input type="number" v-model.number="meshbotStore.restoreCount" min="1" />
              <span class="name">Число восстанавливаемых лимиток</span>
            </label>

            <label>
              <input type="checkbox" v-model="meshbotStore.enableGridShift" />
              <span class="name">Включить смещение сетки</span>
            </label>

            <label>
              <input type="checkbox" v-model="meshbotStore.enableTpShift" />
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
          <i  v-if="visibilityState['block2']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Реальная торговля
        </h2>
      </div>

      <div v-if="visibilityState['block2']" style="padding: 10px;">
        Контекст бота:<br/>
        MOEX → TQBR → D88123 -> SBER
        <div style="padding: 20px 0;">Расписание:</div>
        <!--        <div><input type="checkbox" /> Закрывать тейк после паузы по лучшей цене</div>-->
        <button class="btn">Включить</button>
      </div>

    </div>

    <OrdersComponent
        :buyLevels="meshbotStore.buyLevels"
        :sellOrders="meshbotStore.sellOrders"
        :openTrades="meshbotStore.openTrades"
    />

    <HistoryComponent
        :closedTrades="meshbotStore.closedTrades"
        :totalProfit="meshbotStore.totalProfit"
    />

    <LogComponent
        :logText="logText"
        :remainingRestoreCount="meshbotStore.remainingRestoreCount"
    />

  </div>
</template>

<script>
import OrdersComponent from "@/widgets/MeshBot/components/OrdersComponent.vue";
import HistoryComponent from "@/widgets/MeshBot/components/HistoryComponent.vue";
import LogComponent from "@/widgets/MeshBot/components/LogComponent.vue";

import {useMeshbotStore} from "@/stores/meshbotStore";


export default {
  name: "SimulationComponent",
  components: { OrdersComponent, HistoryComponent, LogComponent },

  setup() {

    //const meshbotStore = useMeshStore(); // Инициализация хранилища
    const meshbotStore = useMeshbotStore();

    const setInitialPrice = () => {
      meshbotStore.setInitialPrice(meshbotStore.initialPrice);
    };

    return {
      meshbotStore,
      setInitialPrice,
    }


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

      /*meshbotStore:{
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

      activeTab2: 0,
      tabs2: [
        { name: "Позиции" },
        { name: "История сделок" },
        { name: "Лог" },
      ],

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

    simulate() {
      this.meshbotStore.timeIndex++;

      // Генерируем случайный множитель шага: положительный или отрицательный
      const multiplier = (Math.random() - 0.5) * 2 * this.meshbotStore.priceStepMultiplier;
      //const multiplier = (Math.random() > 0.5 ? 1 : -1) * this.meshbotStore.priceStepMultiplier;

      const newPrice = this.meshbotStore.currentPrice + this.meshbotStore.priceStep * multiplier;

      //this.meshbotStore.currentPrice += delta;

      // Применяем минимальный шаг
      this.meshbotStore.currentPrice = this.roundToStep(newPrice, this.meshbotStore.priceStep);

      if (this.meshbotStore.currentPrice < 0) this.meshbotStore.currentPrice = 0.1;

      this.meshbotStore.priceData.push({ x: this.meshbotStore.timeIndex, y: this.meshbotStore.currentPrice });

      this.checkBuyOrders();
      this.checkSellOrders();

      this.updateChart();
    },
    
    checkSellOrders() {
      for (let j = 0; j < this.meshbotStore.sellOrders.length; j++) {
        const so = this.meshbotStore.sellOrders[j];
        if (this.meshbotStore.currentPrice >= so.price) {
          this.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);
          this.meshbotStore.sellOrders.splice(j, 1);
          j--;
          this.removeLine("SELL_" + so.price);

          this.meshbotStore.sellPoints.push({ x: this.meshbotStore.timeIndex, y: so.price });

          const idx = this.meshbotStore.openTrades.findIndex(
              t => t.buyPrice === so.linkBuy
          );
          if (idx >= 0) {
            const tr = this.meshbotStore.openTrades[idx];
            // Считаем профит классической формулой (цена продажи - цена покупки)*volume
            const profit = (so.price - tr.buyPrice) * tr.volume;
            this.meshbotStore.totalProfit += profit;
            this.meshbotStore.closedTrades.push({
              buyPrice: tr.buyPrice,
              sellPrice: so.price,
              volume: tr.volume,
              profit,
            });
            this.meshbotStore.openTrades.splice(idx, 1);

            // Восстановление лимитки (если включено)
            if (this.meshbotStore.enableRestore && this.meshbotStore.remainingRestoreCount > 0) {
              if (this.isPositionLimitReached()) {
                this.log("Превышен лимит позиций и лимиток. Восстановление отменено.");
                return;
              }
              // Новая проверка: лимит лимиток
              if (this.meshbotStore.buyLevels.length >= this.meshbotStore.levelsCount) {
                this.log("Превышен лимит лимиток. Восстановление отменено.");
                continue;
              }

              this.meshbotStore.buyLevels.push({
                price: tr.buyPrice,
                volume: this.meshbotStore.volume,
              });
              this.meshbotStore.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "rgba(255,183,77,0.7)",
              });
              this.meshbotStore.remainingRestoreCount--;
              this.log(
                  `Restored BUY limit @${tr.buyPrice.toFixed(
                      2
                  )}. Remaining: ${this.meshbotStore.remainingRestoreCount}`
              );
            }
          }
        }
      }
    },

    log(msg) {
      this.logText += msg + "\n";
      if (this.logBox) {
        this.logBox.scrollTop = this.logBox.scrollHeight;
      }
    },

    shiftGrid() {
      if (!this.meshbotStore.enableGridShift) return;

      this.log("Смещаем сетку в соответствии с текущей ценой...");

      const oldPriceStart = this.meshbotStore.priceStart;
      this.meshbotStore.priceStart = this.meshbotStore.currentPrice;

      // Если включено смещение TP, смещаем TP у открытых сделок
      if (this.meshbotStore.enableTpShift) {
        const shiftValue = this.meshbotStore.priceStart - oldPriceStart;
        for (const ot of this.meshbotStore.openTrades) {
          // Не меняем ot.buyPrice
          ot.takeProfit += shiftValue;
        }
      }

      // 1) Перестраиваем BUY-ордера вокруг новой priceStart
      this.meshbotStore.buyLevels = [];
      this.meshbotStore.linesData = this.meshbotStore.linesData.filter(line => !line.id.startsWith("BUY_"));

      for (let i = 1; i <= this.meshbotStore.levelsCount; i++) {

        if (this.meshbotStore.buyLevels.length >= this.meshbotStore.levelsCount) {
          this.log("Превышен лимит лимиток. Новые лимитки не будут выставлены.");
          break;
        }

        if (this.isPositionLimitReached()) {
          this.log("Превышен лимит позиций. Новые лимитки не будут выставлены.");
          break;
        }
        const levelPrice = this.roundToStep(this.meshbotStore.priceStart - i * this.meshbotStore.gridStep, this.meshbotStore.priceStep);
        this.meshbotStore.buyLevels.push({
          price: levelPrice,
          volume: this.meshbotStore.volume,
        });
        this.meshbotStore.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "rgba(255,183,77,0.7)",
        });
      }

      // 2) Пересоздаём SELL-ордера для (уже) открытых сделок
      this.meshbotStore.linesData = this.meshbotStore.linesData.filter(line => !line.id.startsWith("SELL_"));
      this.meshbotStore.sellOrders = [];

      for (const ot of this.meshbotStore.openTrades) {
        const so = {
          price: ot.takeProfit,
          volume: ot.volume,
          linkBuy: ot.buyPrice,
        };
        this.meshbotStore.sellOrders.push(so);
        this.meshbotStore.linesData.push({
          id: "SELL_" + so.price,
          price: so.price,
          color: "#9B67DB",
        });
      }

      this.updateChart();

      // 3) Выбираем случайный интервал до следующего смещения
      if (this.meshbotStore.enableGridShift) {
        const randomInterval = this.meshbotStore.gridShiftIntervals[
            Math.floor(Math.random() * this.meshbotStore.gridShiftIntervals.length)
            ];
        this.gridShiftTimer = setTimeout(this.shiftGrid, randomInterval);
        this.log(`Следующее смещение через ${randomInterval} мс`);
      }
    },

    isPositionLimitReached() {
      return this.meshbotStore.openTrades.length + this.meshbotStore.buyLevels.length >= this.meshbotStore.maxOpenTrades;
    },

    startSimulation() {
      if (this.meshbotStore.simulationId) {
        this.log("Симуляция уже идёт!");
        return;
      }
      this.log("=== START ===");

      this.inProgress = true;

      // Если данных нет, инициализируем начальные уровни
      if (this.meshbotStore.priceData.length === 0) {
        this.meshbotStore.currentPrice = this.meshbotStore.initialPrice;
        this.initBuyOrders();
      }

      //this.meshbotStore.startSimulation();

      //if (!this.meshbotStore.priceData.length) {
      //this.resetState(); // Только если данных ещё нет
      //}

      this.meshbotStore.simulationId = setInterval(this.simulate, this.meshbotStore.interval);

      if (this.meshbotStore.enableGridShift) {
        this.shiftGrid();
      }
    },

    stopSimulation() {
      if (!this.meshbotStore.simulationId) {
        this.log("Симуляция не запущена!");
        return;
      }

      this.inProgress = false;

      clearInterval(this.meshbotStore.simulationId);
      this.meshbotStore.simulationId = null;

      if (this.gridShiftTimer) {
        clearTimeout(this.gridShiftTimer);
        this.gridShiftTimer = null;
      }

      this.log("=== STOP ===");
    },

    applySettings() {
      this.log("Применили настройки: " + JSON.stringify({
        priceStart: this.meshbotStore.priceStart,
        gridStep: this.meshbotStore.gridStep,
        levelsCount: this.meshbotStore.levelsCount,
        volume: this.meshbotStore.volume,
        takeProfitDistance: this.meshbotStore.takeProfitDistance,
        volatility: this.meshbotStore.volatility,
        interval: this.meshbotStore.interval,
      }));
      //this.resetState();
    },

    initBuyOrders() {

      console.log("Initializing buy orders...");

      if (!this.meshbotStore.linesData) {
        this.meshbotStore.linesData = []; // Инициализация, если не существует
      }

      this.meshbotStore.buyLevels = []; // Сброс существующих уровней
      this.meshbotStore.linesData = this.meshbotStore.linesData.filter(line => !line.id.startsWith("BUY_"));

      for (let i = 1; i <= this.meshbotStore.levelsCount; i++) {
        if (this.meshbotStore.buyLevels.length >= this.meshbotStore.levelsCount) {
          this.log("Превышен лимит лимиток. Новые лимитки не будут выставлены.");
          break;
        }
        if (this.isPositionLimitReached()) {
          this.log("Превышен лимит позиций. Новые позиции не будут выставлены.");
          break;
        }
        const levelPrice = this.meshbotStore.priceStart - i * this.meshbotStore.gridStep;
        this.meshbotStore.buyLevels.push({
          price: levelPrice,
          volume: this.meshbotStore.volume,
        });
        this.meshbotStore.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "rgba(255,183,77,0.7)",
        });
      }

      //console.log("LinesData after initBuyOrders:", toRaw(this.meshbotStore.linesData));

      this.updateChart();
      /*console.log("Buy levels:", this.meshbotStore.buyLevels);
      console.log("Lines data:", this.meshbotStore.linesData);*/
    },

    checkBuyOrders() {
      for (let i = 0; i < this.meshbotStore.buyLevels.length; i++) {
        const bo = this.meshbotStore.buyLevels[i];
        if (this.meshbotStore.currentPrice <= bo.price) {
          if (this.meshbotStore.openTrades.length >= this.meshbotStore.maxOpenTrades) {
            this.log(`Лимит открытых позиций достигнут: ${this.meshbotStore.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }

          this.log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);
          this.meshbotStore.buyLevels.splice(i, 1);
          i--;
          this.removeLine("BUY_" + bo.price);

          this.meshbotStore.buyPoints.push({ x: this.meshbotStore.timeIndex, y: bo.price });

          const trade = {
            buyPrice: bo.price,
            volume: bo.volume,
            takeProfit: bo.price + this.meshbotStore.takeProfitDistance,
          };
          this.meshbotStore.openTrades.push(trade);

          const so = {
            price: trade.takeProfit,
            volume: trade.volume,
            linkBuy: trade.buyPrice,
          };
          this.meshbotStore.sellOrders.push(so);

          this.meshbotStore.linesData.push({
            id: "SELL_" + so.price,
            price: so.price,
            color: "#9B67DB",
          });
        }
      }
    },

  },

  mounted(){

  },

  unmounted() {

  },

  watch: {

  },

  computed: {
    currentPriceStr () {
      return this.meshbotStore.currentPrice.toFixed(2);
    },
    remainingBuyLimits() {
      return Math.max(this.meshbotStore.maxOpenTrades - this.meshbotStore.openTrades.length, 0);
    },
  }
};
</script>
