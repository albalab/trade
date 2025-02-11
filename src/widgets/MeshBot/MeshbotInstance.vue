<template>
  <div class="meshbot-simulator" v-show="isActive">

<!--    {{settings}}<br>
    {{meshbotStore.visibilityState}}<br>
    {{meshbotStore.bots[botIndex].settings}}-->
        <div>
          <div class="meshbot-section-header"
               @click="toggleSectionVisibility('block6')">
            <h2 class="title">
              <i v-if="meshbotStore.visibilityState['block6']"  class="fal fa-chevron-down"></i>
              <i v-else  class="fal fa-chevron-right"></i>
              RAW
            </h2>
          </div>

          <div v-show="meshbotStore.visibilityState['block6']">

            <textarea v-model="selectedBotString" style="margin: 20px; width: 80%; height: 300px;"> </textarea>

          </div>
        </div>

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleSectionVisibility('block1')">
        <h2 class="title">
          <i  v-if="meshbotStore.visibilityState['block1']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Параметры
        </h2>
      </div>

      <div class="section-settings" v-show="meshbotStore.visibilityState.block1">
        <div class="settings-grid">

          <div class="settings-block">
            <div class="settings-block-title">Риск</div>
            <label>
              <input type="number" v-model.number="maxOpenTrades" />
              <span class="name">Лимит открытых позиций<br/> (осталось {{ remainingBuyLimits }})</span>
            </label>

            <label>
              <input type="number" v-model.number="volume" />
              <span class="name">Объём позиций</span>
            </label>
          </div>

          <div class="settings-block">
            <div class="settings-block-title">Сетка</div>
            <label>
              <input type="number" v-model.number="levelsCount" />
              <span class="name">Число лимиток в пакете, шт</span>
            </label>

            <label>
              <input type="number" v-model.number="gridStep" step="1" />
              <span class="name">Шаг сетки, пункты</span>
            </label>

            <label>
              <input type="number" v-model.number="takeProfitDistance" step="1" />
              <span class="name">Тейк, пункты</span>
            </label>
          </div>

          <div class="settings-block">
            <div class="settings-block-title">Улучшение сетки</div>
            <label>
              <input type="checkbox" v-model="enableRestore" />
              <span class="name">Включить восстановление лимиток</span>
            </label>

            <label>
              <input type="number" v-model.number="restoreCount" min="1" />
              <span class="name">Число восстанавливаемых лимиток</span>
            </label>

            <label>
              <input type="checkbox" v-model="enableGridShift" />
              <span class="name">Включить смещение сетки</span>
            </label>

            <label>
              <input type="checkbox" v-model="enableTpShift" />
              <span class="name">Включить смещение тейка</span>
            </label>
          </div>

        </div>

      </div>
    </div>

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleSectionVisibility('block2')">
        <h2 class="title">
          <i v-if="meshbotStore.visibilityState['block2']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Данные
        </h2>
      </div>

      <div v-show="meshbotStore.visibilityState['block2']">

        <div class="settings-items">
          <div class="item">
            <select v-model="meshbotStore.displayMode" style="width: 120px; margin: 0 0 12px; display: inline-block;">
              <option value="all">Сохранять историю</option>
              <option value="latest">Скользящее окно</option>
            </select>

            <label style="position: absolute; display: inline-block; margin-left: 10px;" v-if="meshbotStore.displayMode === 'latest'">
              <input type="number" v-model.number="meshbotStore.latestWindowSize" />
            </label>
          </div>

          <div class="item">
            Цена:
            <input type="number"
                   v-model.number="initialPrice" step="1"
                   @change="meshbotStore.resetBotState(bot.name)"/>

<!--            <p :style="{'visibility': !tradeTimer ? 'hidden' : null}">Текущая цена: {{ settings.currentPrice }}</p>-->

            <!--            <div>
                          <span class="name">Множитель волатильности (>1)</span>
                          <input type="number" v-model.number="priceStepMultiplier" step="0.1" min="1" />
                        </div>-->
          </div>

          <div class="item">
            <span class="name">Волатильность</span>
            <input type="number" v-model.number="volatility" step="0.1" />
          </div>

          <div class="item">
            <span class="name" style="display: inline-block; width: 120px; ">Период тиков (ms)</span>
            <input type="number" v-model.number="interval" />
          </div>
        </div>
      </div>
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleSectionVisibility('block3')">
        <h2 class="title">
          <i v-if="meshbotStore.visibilityState['block3']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Торговля
        </h2>
      </div>

      <div v-show="meshbotStore.visibilityState.block3">

        <div>
          <div style="padding: 10px 20px 0;">
            Смещение через: {{targetGridShiftInterval - gridShiftCounter}}сек
          </div>

          <div style="padding: 10px 20px;">
            <button class="btn" @click='ordersStore.sendLimitBuyOrder(1, 105, selectedBot.ticker, "MOEX", "buy", "D88141", selectedBot.name)'>sendLimitBuyOrder</button>
            <button class="btn" @click='ordersStore.cancelBotBuyOrders(selectedBot.name)'>cancelBotBuyOrders</button>
          </div>

        </div>


        <div class="mesh-simulation-buttons" style="position: relative;">
          <button class="btn"
                  @click="!isTradingEnabled ? activateTrading() : deactivateTrading()">
            <i class="fal" :class="{'fa-stop': isTradingEnabled, 'fa-play': !isTradingEnabled}"></i>
          </button>
          <button class="btn" @click="meshbotStore.resetBotState(bot.name)">
            <i class="fal fa-repeat"></i>
          </button>

          <label class="checkbox-simulator">
            <input class="input" type="checkbox" v-model="isGenerateData"/>
            <span class="name">Генерировать данные</span>
          </label>

          <label class="checkbox-simulator">
            <input class="input" type="checkbox" v-model="isRealTrading"/>
            <span class="name">Реальная торговля</span>
          </label>

          <div style="position: absolute; right: 10px; top: 20px;">
            <strong>Прибыль:</strong> {{ parseFloat(settings.totalProfit.toFixed(2)) }}
          </div>
        </div>

        <div>
          <ChartComponent :isActiveBot="isActive"/>
        </div>

        <div style="height: 50px; overflow: auto; ">
          <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr;">
            <div>
              <div>Active BUY orders:</div>
              <div v-for="ord in botBuyOrders" :key="ord.data.orderNumber">
                • Order #{{ ord.data.orderNumber }} @{{ ord.data.price }} ({{ ord.data.status }})
              </div>
            </div>
            <div>
              <div>Filled BUY orders + takeShift = rprofit:</div>
              <div v-for="ord in botBuyOrdersFilled" :key="ord.data.orderNumber">
                • Order #{{ ord.data.orderNumber }} @{{ ord.data.price }} ({{ ord.data.status }})
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleSectionVisibility('block4')">
        <h2 class="title">
          <i v-if="meshbotStore.visibilityState['block4']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Активные позиции
        </h2>
      </div>

        <OrdersComponent
            v-if="meshbotStore.visibilityState['block4']"
            :buyLevels="settings.buyLevels"
            :profitLevels="settings.profitLevels"
            :openTrades="settings.openTrades"
        />
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleSectionVisibility('block5')">
        <h2 class="title">
          <i v-if="meshbotStore.visibilityState['block5']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          История сделок
        </h2>
      </div>
      <HistoryComponent
          v-if="meshbotStore.visibilityState['block5']"
          :closedTrades="settings.closedTrades"
          :totalProfit="settings.totalProfit"
      />
    </div>

  </div>
</template>

<script>

//import { computed } from 'vue';

//import { useOrderProcessing } from '@/widgets/MeshBot/composables/useOrderProcessing';

//import { useGridShift } from '@/widgets/MeshBot/composables/useGridShift';
import { usePriceUtils } from '@/widgets/MeshBot/composables/usePriceUtils';
import usePriceMonitor from '@/widgets/MeshBot/composables/usePriceMonitor';

import { useTradeHistory } from '@/widgets/MeshBot/composables/useTradeHistory';

import {useMeshbotStore} from "@/widgets/MeshBot/stores/meshbotStore";
import { useDataFabricStore } from '@/stores/dataFabricStore';
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';

import OrdersComponent from "@/widgets/MeshBot/components/OrdersComponent.vue";
import HistoryComponent from "@/widgets/MeshBot/components/HistoryComponent.vue";
import ChartComponent from '@/widgets/MeshBot/components/ChartComponent.vue';

export default {
  name: "MeshbotInstance",

  components: {
    OrdersComponent,
    HistoryComponent,
    ChartComponent,
  },

  setup(props) {

    const ordersStore = useOrdersStore();
    const meshbotStore = useMeshbotStore();
    const dataFabricStore = useDataFabricStore();
    const orderbooksStore = useOrderbooksStore();

    const { roundToStep } = usePriceUtils();
    const { startPriceMonitor, stopPriceMonitor } = usePriceMonitor(props.bot.name);
    const { trimTradeHistory } = useTradeHistory();
    //const { shiftGrid, cancelShift } = useGridShift(meshbotStore, ordersStore, dataFabricStore);
    //const { processOrders } = useOrderProcessing({ bot: props.bot, ordersStore, meshbotStore, settings });
    //processOrders();

    return {
      meshbotStore,
      orderbooksStore,
      ordersStore,
      dataFabricStore,

      startPriceMonitor,
      stopPriceMonitor,

      roundToStep,

      trimTradeHistory,

    }

  },

  props: {
    bot: Object,
    isActive: Boolean,
  },

  data() {
    return {
      isFirstStartFilled: false,

      priceMonitor: null,

      realOrders: [], // массив, который будет хранить реальные ордера
      isRealTradingActive: false, // флаг реальной торговли

      sideOrder: 'buy',
      priceOrder: null,
      exchange: '',

      isTradingEnabled: false,
      tradeTimer: null,

      gridShiftCounter: 0,
      targetGridShiftInterval: 0,

      /*isGenerateData: true,
      isRealTrading: false,*/

      //displayMode: "all",
      latestWindowSize: 100,

      shiftMeshTimer: null,

    };
  },

  methods: {

    getRandomGridShiftInterval() {
      const intervals = this.settings.gridShiftIntervals;
      const randomIndex = Math.floor(Math.random() * intervals.length);
      return intervals[randomIndex];
    },

    processOrderStatuses() {
      // Перебираем все лимитные ордера из хранилища
      this.ordersStore.limitOrders.forEach(order => {
        // Если ордер относится к нашему боту
        if (order.data.botId === this.bot.name) {
          // Приводим цену ордера к пунктовому значению
          const orderPrice = Number((order.data.price * 100).toFixed(0));
          // Если ордер уже обработан, пропускаем его
          if (order.data._setted) return;

          // Если заполнен buy-ордер
          if (order.data.side === 'buy' && order.data.status === 'filled') {
            console.log(`Buy order filled at ${orderPrice}`);
            order.data._setted = true;

            // Удаляем линию для BUY-ордера
            this.meshbotStore.removeLine(this.bot.name, "BUY_" + orderPrice);
            // Добавляем точку входа на график
            this.settings.buyPoints.push({ x: this.settings.timeIndex, y: orderPrice });

            // Рассчитываем цену тейк-профита
            const profitPriceLevel = orderPrice + this.settings.takeProfitDistance;

            // Регистрируем новый уровень тейка
            this.settings.profitLevels.push({
              price: profitPriceLevel,
              volume: this.settings.volume,
              linkBuy: orderPrice
            });

            // Рисуем линию для SELL-ордера (тейк)
            this.settings.linesData.push({
              id: "SELL_" + profitPriceLevel,
              price: profitPriceLevel,
              color: "rgba(255,183,77,0.7)"
            });

            // Переводим цену в «рыночное» значение
            const profitPrice = parseFloat((profitPriceLevel / 100).toFixed(2));
            console.log('Send limit order from bot: ', this.bot.name, profitPrice);

            // Отправляем лимитный ордер на продажу
            this.ordersStore.sendLimitOrder(
                this.settings.volume,
                profitPrice,
                order.data.ticker,
                'MOEX',
                'sell', // направление – продажа
                'D88141',
                this.bot.name
            );
          }

          // Если заполнен sell-ордер
          if (order.data.side === 'sell' && order.data.status === 'filled') {
            console.log(`Sell order filled at ${orderPrice}`);
            order.data._setted = true;

            // Удаляем SELL-линию
            this.meshbotStore.removeLine(this.bot.name, "SELL_" + orderPrice);
            // Регистрируем точку продажи – можно использовать метод addSellPoint
            this.meshbotStore.addSellPoint(this.bot.name, {
              x: this.settings.timeIndex,
              y: orderPrice
            });
          }
        }
      });
    },

    shiftGrid(isRealTrade, bot, settings, enableGridShift, setBuyOrders) {
      if (!settings || !enableGridShift) return;
      console.log("Смещаем сетку...");

      if (isRealTrade) {
        const dataFabric = this.dataFabricStore.lastValues.data;
        if (dataFabric && bot && dataFabric[bot.ticker]) {
          const newPrice = dataFabric[bot.ticker].oBestBidPrice * 100;
          settings.currentPrice = newPrice.toFixed(0);
        }
        this.ordersStore.cancelBotBuyOrders(bot.name).then(() => {
          // Очищаем старые лимитки и линии
          settings.buyLevels = [];
          settings.linesData = settings.linesData.filter(line => !line.id.startsWith("BUY_"));
          // Инициализируем buyLevels заново
          this.meshbotStore.initBuyLevels(bot.name);
          // Вызываем функцию установки ордеров
          setBuyOrders();
          const randomIndex = Math.floor(Math.random() * settings.gridShiftIntervals.length);
          const randomInterval = settings.gridShiftIntervals[randomIndex];
          this.shiftMeshTimer = setTimeout(() => {
            this.shiftGrid(isRealTrade, bot, settings, enableGridShift, setBuyOrders);
          }, randomInterval);
          console.log(`Следующее смещение через ${randomInterval} мс`);
        });
      } else {
        settings.buyLevels = [];
        settings.linesData = settings.linesData.filter(line => !line.id.startsWith("BUY_"));
        this.meshbotStore.initBuyLevels(bot.name);
        setBuyOrders();
        const randomIndex = Math.floor(Math.random() * settings.gridShiftIntervals.length);
        const randomInterval = settings.gridShiftIntervals[randomIndex];
        this.shiftMeshTimer = setTimeout(() => {
          this.shiftGrid(isRealTrade, bot, settings, enableGridShift, setBuyOrders);
        }, randomInterval);
        console.log(`Следующее смещение через ${randomInterval} мс`);
      }
    },
    cancelShift() {
      if (this.shiftMeshTimer) {
        clearTimeout(this.shiftMeshTimer);
        this.shiftMeshTimer = null;
      }
    },

    activateTrading() {
      if (this.isTradingEnabled) return;
      this.isTradingEnabled = true;

      //this.meshbotStore.resetBotState(this.bot.name);

      // Инициализируем счетчик и целевой интервал для сдвига сетки
      this.gridShiftCounter = 0;
      this.targetGridShiftInterval = this.getRandomGridShiftInterval();

      // Запускаем основной таймер (например, с интервалом this.interval мс, который можно задать равным 1000 для секунда)
      this.tradeTimer = setTimeout(this.processTradingTick, this.interval);

      /*if (this.isRealTrading) {
        // Передаём функцию, которая устанавливает реальные ордера
        this.shiftGrid(this.isRealTrading, this.bot, this.settings, this.enableGridShift, this.submitRealBuyOrders);
      } else {
        // Или передаём функцию для симуляционных ордеров
        this.shiftGrid(this.isRealTrading, this.bot, this.settings, this.enableGridShift, this.setSimulatedBuyOrders);
      }*/

    },

    deactivateTrading() {
      this.ordersStore.cancelBotBuyOrders(this.selectedBot.name);
      if (this.tradeTimer) {
        clearTimeout(this.tradeTimer);
        this.tradeTimer = null;
      }
      this.isTradingEnabled = false;
      this.isFirstStartFilled = false;
      console.log("=== STOP ===");
    },


    /*deactivateTrading() {

      this.ordersStore.cancelBotBuyOrders(this.selectedBot.name);

      //if (!this.isTradingEnabled) return;

      if(this.tradeTimer){
        clearInterval(this.tradeTimer);
        this.tradeTimer = null;
      }

      if (this.shiftMeshTimer) {
        clearTimeout(this.shiftMeshTimer);
        this.shiftMeshTimer = null;
      }

      this.isTradingEnabled = false;

      console.log("=== STOP ===");
    },*/

    processTradingTick() {
      if (!this.isTradingEnabled || !this.settings) return;

      // Увеличиваем индекс времени (или обновляем счётчик тиков)
      this.settings.timeIndex++;

      // --- Торговая логика ---
      if (this.isRealTrading && !this.isFirstStartFilled) {
        this.isFirstStartFilled = true;
        const dataFabric = this.dataFabricStore.lastValues.data;
        if (!dataFabric) return;
        const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);
        if (!bot) return;
        if (dataFabric[bot.ticker]) {
          const newPrice = dataFabric[bot.ticker].oBestBidPrice * 100;
          this.initialPrice = Number(newPrice.toFixed(0));
          this.settings.currentPrice = Number(newPrice.toFixed(0));
          this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });
          this.trimTradeHistory(this.settings, this.meshbotStore.displayMode, this.meshbotStore.latestWindowSize);
          this.submitRealBuyOrders();
        }
      } else {
        const multiplier = (Math.random() - 0.5) * 2 * this.priceStepMultiplier;
        let newPrice = this.settings.currentPrice + this.priceStep * multiplier;
        if (!this.isGenerateData) {
          const data = this.dataFabricStore.lastValues.data;
          if (!data) return;
          const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);
          if (data[bot.ticker]) {
            newPrice = data[bot.ticker].oBestBidPrice * 100;
            this.initialPrice = newPrice;
          }
        }
        this.settings.currentPrice = this.roundToStep(newPrice, this.priceStep);
        if (this.settings.currentPrice < 0) this.settings.currentPrice = 0;
        this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });
        this.trimTradeHistory(this.settings, this.meshbotStore.displayMode, this.meshbotStore.latestWindowSize);
        this.setSimulatedBuyOrders();
        this.setSimulatedProfitLevels();
      }

      // --- Вызываем метод, который обрабатывает ордера из хранилища ---
      this.processOrderStatuses();

      // --- Обновление счетчика для сдвига сетки ---
      this.gridShiftCounter++;  // увеличиваем счетчик на 1 (1 секунда)
      if (this.enableGridShift && this.gridShiftCounter >= this.targetGridShiftInterval) {
        console.log("Счетчик достиг целевого интервала, выполняем сдвиг сетки");

        // Если реальная торговля — обновляем цену и отменяем лимитные ордера
        if (this.isRealTrading) {
          const dataFabric = this.dataFabricStore.lastValues.data;
          if (dataFabric) {
            const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);
            if (bot && dataFabric[bot.ticker]) {
              const newPrice = dataFabric[bot.ticker].oBestBidPrice * 100;
              this.settings.currentPrice = newPrice.toFixed(0);
            }
          }
          this.ordersStore.cancelBotBuyOrders(this.bot.name);
        }
        // Очищаем старые лимитки и линии
        this.settings.buyLevels = [];
        this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));
        // Инициализируем buyLevels заново
        this.meshbotStore.initBuyLevels(this.bot.name);
        // Вызываем функцию установки ордеров (в зависимости от режима торговли)
        if (this.isRealTrading) {
          this.submitRealBuyOrders();
        } else {
          this.setSimulatedBuyOrders();
        }
        // Сбрасываем счетчик и выбираем новый целевой интервал
        this.gridShiftCounter = 0;
        this.targetGridShiftInterval = this.getRandomGridShiftInterval();
        console.log(`Новый целевой интервал для сдвига: ${this.targetGridShiftInterval} секунд`);
      }

      // Планируем следующий тик
      if (this.isTradingEnabled) {
        this.tradeTimer = setTimeout(this.processTradingTick, this.interval);
      }
    },


    /*processTradingTick() {

      if (!this.isTradingEnabled) return;

      if(!this.settings) return;

      this.settings.timeIndex++;

      if(this.isRealTrading) {

        // Здесь необходимо сделать нормировку цены по шагу цены, а пока хардкод 100
        const dataFabric = this.dataFabricStore.lastValues.data;
        if(!dataFabric) return;

        const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);
        if(!bot) return;

        if(dataFabric[bot.ticker]){
          const newPrice = dataFabric[bot.ticker].oBestBidPrice * 100;

          this.initialPrice = Number(newPrice.toFixed(0));
          this.settings.currentPrice = Number(newPrice.toFixed(0));

          this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

          this.trimTradeHistory(this.settings, this.meshbotStore.displayMode, this.meshbotStore.latestWindowSize);

          this.submitRealBuyOrders();
          //this.setRealProfitOrders();

        }

      } else {

        const multiplier = (Math.random() - 0.5) * 2 * this.priceStepMultiplier;
        let newPrice = this.settings.currentPrice + this.priceStep * multiplier;

        if(!this.isGenerateData){

          const data = this.dataFabricStore.lastValues.data;
          if(!data) return;

          const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);

          if(data[bot.ticker]){
            newPrice = data[bot.ticker].oBestBidPrice * 100;
            this.initialPrice = newPrice;
          }

        }

        this.settings.currentPrice = this.roundToStep(newPrice, this.priceStep);

        if (this.settings.currentPrice < 0) this.settings.currentPrice = 0;

        this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

        this.trimTradeHistory(this.settings, this.meshbotStore.displayMode, this.meshbotStore.latestWindowSize);

        this.setSimulatedBuyOrders();
        this.setSimulatedProfitLevels();

        if (this.isTradingEnabled) {
          this.tradeTimer = setTimeout(this.processTradingTick, this.interval);
        }
      }
    },*/

    setSimulatedBuyOrders() {

      if(!this.settings  || this.isRealTrading) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i];

        // событие = "Покупка по уровню сетки"
        if (this.settings.currentPrice <= bo.price) {

          console.log(`EXEC BUY @${parseFloat(bo.price.toFixed(2))}, vol=${bo.volume}`);

          //Убираем уровень сработавшей заявки и очищаем горизонтальную линию
          this.settings.buyLevels.splice(i, 1);
          i--;
          this.meshbotStore.removeLine( this.bot.name, "BUY_" + bo.price);

          //Добавляем вертикальную линию выхода из сделки
          this.settings.buyPoints.push({x: this.settings.timeIndex, y: bo.price});

          //Сохраняем в хранилище открытую позицию
          const trade = {
            buyPrice: bo.price,
            volume: bo.volume,
            takeProfit: bo.price + this.takeProfitDistance,
          };
          this.settings.openTrades.push(trade);

          const so = {
            price: trade.takeProfit,
            volume: trade.volume,
            linkBuy: trade.buyPrice,
          };
          this.settings.profitLevels.push(so);

          this.settings.linesData.push({
            id: "SELL_" + so.price,
            price: so.price,
            color: "#9B67DB",
          });

        }

      }
    },

    setSimulatedProfitLevels() {

      if(!this.settings) return;

      for (let j = 0; j < this.settings.profitLevels.length; j++) {
        const so = this.settings.profitLevels[j];
        if (this.settings.currentPrice >= so.price) {
          console.log(`EXEC SELL @${parseFloat(so.price.toFixed(2))}, vol=${so.volume}`);


          this.settings.profitLevels.splice(j, 1);
          j--;
          this.meshbotStore.removeLine( this.bot.name, "SELL_" + so.price);

          this.settings.sellPoints.push({x: this.settings.timeIndex, y: so.price});

          const idx = this.settings.openTrades.findIndex(
              t => t.buyPrice === so.linkBuy
          );
          if (idx >= 0) {
            const tr = this.settings.openTrades[idx];
            // Считаем профит классической формулой (цена продажи - цена покупки)*volume
            const profit = (so.price - tr.buyPrice) * tr.volume;
            this.settings.totalProfit += profit;
            this.settings.closedTrades.push({
              buyPrice: tr.buyPrice,
              sellPrice: so.price,
              volume: tr.volume,
              profit,
            });
            this.settings.openTrades.splice(idx, 1);

            if (this.enableRestore && this.settings.remainingRestoreCount > 0) {
              if (this.isPositionLimitReached) {
                console.log("Превышен лимит позиций и лимиток. Восстановление отменено.");
                return;
              }

              if (this.settings.buyLevels.length >= this.levelsCount) {
                console.log("Превышен лимит лимиток. Восстановление отменено.");
                continue;
              }

              this.settings.buyLevels.push({
                price: tr.buyPrice,
                volume: this.volume,
              });
              this.settings.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "rgba(255,183,77,0.7)",
              });
              this.settings.remainingRestoreCount--;
              console.log(`Restored BUY limit @${tr.buyPrice.toFixed(2)}. Remaining: ${this.settings.remainingRestoreCount}`);
            }
          }

        }
      }
    },

    async submitRealBuyOrders() {

      if(!this.isTradingEnabled) return;
      if(!this.settings) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i]

        /*if (this.settings.openTrades.length >= this.maxOpenTrades) {
          console.log(`Лимит открытых позиций достигнут: ${this.maxOpenTrades}`);
          return;
        }*/

        if (this.settings.currentPrice >= bo.price) { // && !isOrderAlreadyPlaced
          console.log('Set buy limit, current price: ', this.settings.currentPrice/100, ', Buy Level price: ', bo.price/100, ', Volume', bo.volume);

          const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);
          if(!bot) return;

          await this.ordersStore.sendLimitBuyOrder(1, bo.price/100, bot.ticker, 'MOEX', 'buy', 'D88141', bot.name );

          //bot.placedBuyOrders.push(bo.price);

          this.settings.buyLevels.splice(i, 1);
          i--;

        }

      }

    },

    toggleSectionVisibility(blockId) {
      this.meshbotStore.visibilityState[blockId] = !this.meshbotStore.visibilityState[blockId];
    },

  },

  mounted() {
    this.startPriceMonitor();
    this.meshbotStore.resetBotState(this.bot.name);
  },

  beforeUnmount() {
    this.stopPriceMonitor();
  },

  /*watch: {

    'ordersStore.limitOrders': {
      handler(newOrders) {

        console.log('WATCHER NEW ORDERS', JSON.parse(JSON.stringify(newOrders.filter(o => o.data.botId))));

        newOrders.forEach(order => {
          if (order.data.botId === this.bot.name) {
            const orderPrice = Number((order.data.price * 100).toFixed(0));

            if (order.data._setted) return;

            // 1) Если buy-ордер исполнен:
            if (order.data.side === 'buy' && order.data.status === 'filled') {
              console.log(`Buy order filled at ${orderPrice}`);

              order.data._setted = true;

              // • Удаляем линию
              this.meshbotStore.removeLine( this.bot.name, "BUY_" + orderPrice);
              // • Отмечаем точку на графике
              this.settings.buyPoints.push({ x: this.settings.timeIndex, y: orderPrice });

              // • Считаем takeProfitPrice
              const profitPriceLevel = orderPrice + this.takeProfitDistance;

              // • Добавляем «логическую» запись в profitLevels (для графика, аналитики)
              this.settings.profitLevels.push({
                price: profitPriceLevel,
                volume: this.volume,
                linkBuy: orderPrice
              });

              // • Рисуем SELL-линию на графике (чтобы видеть уровень тейка)
              this.settings.linesData.push({
                id: "SELL_" + profitPriceLevel,
                price: profitPriceLevel,
                color: "rgba(255,183,77,0.7)"
              });

              // переводим обратно из пунктов в «рыночную» цену
              const profitPrice = parseFloat((profitPriceLevel / 100).toFixed(2));

              console.log('Send limit order from bot: ', this.bot.name, profitPrice);

              // • Отправляем реальный лимит на продажу
              this.ordersStore.sendLimitOrder(
                  this.volume,
                  profitPrice,
                  order.data.ticker,
                  'MOEX',
                  'sell',               // направление — продажа
                  'D88141',
                  this.bot.name
              );
            }

            // 2) Если sell-ордер исполнен:
            if (order.data.side === 'sell' && order.data.status === 'filled') {
              console.log(`Sell order filled at ${orderPrice}`);

              order.data._setted = true;

              // Удаляем линию:
              this.meshbotStore.removeLine(this.bot.name, "SELL_" + orderPrice);
              // Ставим точку продажи
              this.settings.sellPoints.push({ x: this.settings.timeIndex, y: orderPrice });
              // ... если нужно, считаем финальный профит и т.д.
            }
          }
        });
      },
      deep: true
    }
  },*/

  computed: {


    isGenerateData: {
      get() { return this.bot.settings.isGenerateData; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'isGenerateData', newVal); }
    },
    isRealTrading: {
      get() { return this.bot.settings.isRealTrading; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'isRealTrading', newVal); }
    },
    maxOpenTrades: {
      get() { return this.bot.settings.maxOpenTrades; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'maxOpenTrades', newVal); }
    },
    volume: {
      get() { return this.bot.settings.volume; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'volume', newVal); }
    },
    levelsCount: {
      get() { return this.bot.settings.levelsCount; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'levelsCount', newVal); }
    },
    gridStep: {
      get() { return this.bot.settings.gridStep; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'gridStep', newVal); }
    },
    takeProfitDistance: {
      get() { return this.bot.settings.takeProfitDistance; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'takeProfitDistance', newVal); }
    },
    enableRestore: {
      get() { return this.bot.settings.enableRestore; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'enableRestore', newVal); }
    },
    restoreCount: {
      get() { return this.bot.settings.restoreCount; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'restoreCount', newVal); }
    },
    enableGridShift: {
      get() { return this.bot.settings.enableGridShift; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'enableGridShift', newVal); }
    },
    enableTpShift: {
      get() { return this.bot.settings.enableTpShift; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'enableTpShift', newVal); }
    },
    initialPrice: {
      get() { return this.bot.settings.initialPrice; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'initialPrice', newVal); }
    },
    volatility: {
      get() { return this.bot.settings.volatility; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'volatility', newVal); }
    },
    interval: {
      get() { return this.bot.settings.interval; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'interval', newVal); }
    },
    priceStep: {
      get() { return this.bot.settings.priceStep; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'priceStep', newVal); }
    },
    priceStepMultiplier: {
      get() { return this.bot.settings.priceStepMultiplier; },
      set(newVal) { this.meshbotStore.updateBotSetting(this.bot.name, 'priceStepMultiplier', newVal); }
    },


    isPositionLimitReached() {
      if(!this.settings) return;
      return this.settings.openTrades.length + this.settings.buyLevels.length >= this.maxOpenTrades;
    },

    botBuyOrdersFilled() {
      return this.ordersStore.limitOrders.filter(o =>
          o.data.botId === this.selectedBot.name &&
          o.data.side === 'buy' &&
          o.data.status === 'filled' &&
          !o.data._setted
      )
    },

    botBuyOrders() {
      return this.ordersStore.limitOrders.filter(o =>
          o.data.botId === this.selectedBot.name
          && o.data.side === 'buy'
          && o.data.status === 'working'
      )
    },

    bots() {
      return this.meshbotStore.bots;
    },
    selectedBotString() {
      const bot = this.meshbotStore.bots.find(bot => bot.name === this.bot.name);
      return JSON.stringify(bot, null, 2);
    },
    selectedBot() {
      return this.meshbotStore.bots.filter( bot => bot.name === this.meshbotStore.activeBotName)[0];
    },
    settings() {
      return this.bot.settings;
    },
    remainingBuyLimits() {
      if(this.settings){
        return Math.max(this.maxOpenTrades - this.settings.openTrades.length, 0);
      } else {
        return null;
      }
    },
  }
};
</script>

