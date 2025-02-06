<template>
  <div class="meshbot-simulator">

    <div>
      <div>
        placedBuyOrdersIds: {{currentBot.placedBuyOrdersIds}}
      </div>
      <button @click='ordersStore.sendLimitBuyOrder(1, 105, currentBot.ticker, "MOEX", "buy", "D88141", currentBot.name)'>sendLimitBuyOrder</button>
      <button @click='ordersStore.cancelBotBuyOrders(currentBot.name)'>cancelBotBuyOrders</button>
    </div>


    <!--    <div>
          <div class="meshbot-section-header"
               @click="toggleBlock('block6')">
            <h2 class="title">
              <i v-if="meshbotStore.visibilityState['block6']"  class="fal fa-chevron-down"></i>
              <i v-else  class="fal fa-chevron-right"></i>
              RAW
            </h2>
          </div>

          <div v-show="meshbotStore.visibilityState['block6']">

            <textarea v-model="currentBotString" style="margin: 20px; width: 80%; height: 300px;"> </textarea>

          </div>
        </div>-->

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleBlock('block1')">
        <h2 class="title">
          <i  v-if="meshbotStore.visibilityState['block1']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Параметры

          <div class="delete-bot" style="text-transform: none; font-weight: normal;">
            <div class="delete-bot-button"
                 @click.stop="deleteBot()">
              Удалить «{{botName}}»
            </div>
          </div>
        </h2>
      </div>

      <div class="section-settings" v-show="meshbotStore.visibilityState.block1">
        <div class="settings-grid">

          <div class="settings-block">
            <div class="settings-block-title">Риск</div>
            <label>
              <input type="number" v-model.number="settings.maxOpenTrades" />
              <span class="name">Лимит открытых позиций<br/> (осталось {{ remainingBuyLimits }})</span>
            </label>

            <label>
              <input type="number" v-model.number="settings.volume" />
              <span class="name">Объём позиций</span>
            </label>
          </div>

          <div class="settings-block">
            <div class="settings-block-title">Сетка</div>
            <label>
              <input type="number" v-model.number="settings.levelsCount" />
              <span class="name">Число лимиток в пакете, шт</span>
            </label>

            <label>
              <input type="number" v-model.number="settings.gridStep" step="1" />
              <span class="name">Шаг сетки, пункты</span>
            </label>

            <label>
              <input type="number" v-model.number="settings.takeProfitDistance" step="1" />
              <span class="name">Тейк, пункты</span>
            </label>
          </div>

          <div class="settings-block">
            <div class="settings-block-title">Улучшение сетки</div>
            <label>
              <input type="checkbox" v-model="settings.enableRestore" />
              <span class="name">Включить восстановление лимиток</span>
            </label>

            <label>
              <input type="number" v-model.number="settings.restoreCount" min="1" />
              <span class="name">Число восстанавливаемых лимиток</span>
            </label>

            <label>
              <input type="checkbox" v-model="settings.enableGridShift" />
              <span class="name">Включить смещение сетки</span>
            </label>

            <label>
              <input type="checkbox" v-model="settings.enableTpShift" />
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
          <i v-if="meshbotStore.visibilityState['block2']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Данные
        </h2>
      </div>

      <div v-show="meshbotStore.visibilityState['block2']">

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
            <input type="number"
                   v-model.number="settings.initialPrice" step="1"
                   @change="resetState()"/>

            <p>Текущая цена: {{ settings.currentPrice }}</p>

            <!--            <div>
                          <span class="name">Множитель волатильности (>1)</span>
                          <input type="number" v-model.number="settings.priceStepMultiplier" step="0.1" min="1" />
                        </div>-->
          </div>

          <div class="item">
            <span class="name">Волатильность</span>
            <input type="number" v-model.number="settings.volatility" step="0.1" />
          </div>

          <div class="item">
            <span class="name">Период тиков (ms)</span>
            <input type="number" v-model.number="settings.interval" />
          </div>
        </div>
      </div>
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block3')">
        <h2 class="title">
          <i v-if="meshbotStore.visibilityState['block3']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Торговля
        </h2>
      </div>

      <div v-show="meshbotStore.visibilityState.block3">
        <div class="mesh-simulation-buttons" style="position: relative;">
          <button class="btn" @click="!tradeTimer ? startTradeTimers() : stopTradeTimers()">
            <i class="fal" :class="{'fa-pause': tradeTimer, 'fa-play': !tradeTimer}"></i>
          </button>
          <button class="btn" @click="resetState()">
            <i class="fal fa-repeat"></i>
          </button>

          <label class="checkbox-simulator">
            <input class="input" type="checkbox" v-model="isGenerateData"/>
            <span class="name">Генерировать данные</span>
          </label>

          <label class="checkbox-simulator">
            <input class="input" type="checkbox" v-model="isRealTrade" @change="toggleRealTrade"/>
            <span class="name">Реальная торговля</span>
          </label>

          <div style="position: absolute; right: 10px; top: 20px;">
            <strong>Прибыль:</strong> {{ settings.totalProfit.toFixed(2) }}
          </div>
        </div>

        <ChartComponent :isActiveBot="isActiveBot"/>
<!--        <div class="chart">
          <canvas ref="chartCanvas" width="600" height="300"></canvas>
        </div>-->
      </div>
    </div>

    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block4')">
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
           @click="toggleBlock('block5')">
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

import {useMeshbotStore} from "@/stores/meshbotStore";
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

  setup() {

    const ordersStore = useOrdersStore();
    const orderbooksStore = useOrderbooksStore();

    const dataFabricStore = useDataFabricStore();
    const meshbotStore = useMeshbotStore();

    return {
      meshbotStore,
      orderbooksStore,
      ordersStore,
      dataFabricStore,
    }

  },

  props: {
    bot: Object,
    botName: String,
    isActiveBot: Boolean,
    stopBotFromParentIndex: Number,
    botId: Number,
  },

  data() {
    return {
      
      realOrders: [], // массив, который будет хранить реальные ордера
      isRealTradeActive: false, // флаг реальной торговли

      templateGroupOrders: [
        {
          side: "buy",
          quantity: 1,
          price: null,
          instrument: {
            symbol: "SBER",
            exchange: "MOEX",
            instrumentGroup: "TQBR",
          },
          user: {
            portfolio: "D88141",
          },
          timeInForce: "oneday",
        },
        {
          side: "buy",
          quantity: 1,
          price: null,
          instrument: {
            symbol: "MTLR",
            exchange: "MOEX",
            instrumentGroup: "TQBR",
          },
          user: {
            portfolio: "D88141",
          },
          timeInForce: "oneday",
        }
      ],

      groupOrders: [],

      sideOrder: 'buy',
      priceOrder: null,
      exchange: '',

      selectedOrders: [],

      tradeTimer: null,
      
      isGenerateData: false,
      isRealTrade: true,

      forwardPadding: 10,

      displayMode: "all",
      latestWindowSize: 100,

      shiftMeshTimer: null,

    };
  },

  methods: {

    /*async sendGroupLimitOrders(orders, extra) {
      try {
        const result = await this.ordersStore.sendGroupLimitOrders(orders, extra);

        const newOrders = result.data.map((order, index) => {
          if (order.data?.message === "success" && order.data?.orderNumber) {
            const originalOrder = orders[index];
            return {
              data: {
                id: order.data.orderNumber,
                symbol: originalOrder.instrument.symbol,
                orderNumber: order.data.orderNumber,
                side: originalOrder.side,
                quantity: originalOrder.quantity,
                price: originalOrder.price,
                exchange: originalOrder.instrument.exchange,
                portfolio: originalOrder.user.portfolio,
                timeInForce: originalOrder.timeInForce,
                volume: originalOrder.quantity * originalOrder.price,
                qty: originalOrder.quantity,
              },
            };
          }
          return null;
        }).filter(Boolean);

        // Объединяем старые и новые ордера
        const existingOrders = [...this.ordersStore.limitOrders];
        const updatedOrders = [...existingOrders];

        newOrders.forEach((newOrder) => {
          const existingIndex = updatedOrders.findIndex(
              (order) => order.data.id === newOrder.data.id
          );

          if (existingIndex > -1) {
            // Если ордер уже существует, обновляем его
            updatedOrders[existingIndex] = newOrder;
          } else {
            // Если ордера нет, добавляем его
            updatedOrders.push(newOrder);
          }
        });

        this.ordersStore.limitOrders = updatedOrders;

      } catch (error) {
        console.error("Ошибка при отправке группы лимитных ордеров:", error.message);
      }
    },*/

    /*async cancelGroupOrders(orderIds) {
      try {
        const params = {
          orderIds: orderIds,
          portfolio: "D88141",
          exchange: "MOEX",
          stop: false,
        };

        const response = await this.ordersStore.cancelGroupOrders(params);

        if (response.success) {
          const ordersToRemove = response.data.map((order) => order.orderId);

          if (ordersToRemove.length > 0) {
            this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
                (order) => !ordersToRemove.includes(order.data.orderNumber)
            );
          }
        }
      } catch (error) {
        console.error("Ошибка при отмене ордеров:", error.message);
      }
    },*/


    removeLine(id) {
      const idx = this.settings.linesData.findIndex(l => l.id === id);
      if (idx >= 0) {
        this.settings.linesData.splice(idx, 1);
      }
    },

    async shiftRealMesh() {

      if(!this.tradeTimer) return;
      if(!this.settings) return;
      if(!this.settings.enableGridShift) return;

      console.log("Смещаем сетку в соответствии с текущей ценой...");

      // Отменяем реальные лимитки
      //await this.ordersStore.cancelAllOrders('MOEX', 'D88141');
      await this.ordersStore.cancelBotBuyOrders(this.botName);


      // Стираем старые лимитки с графика
      this.settings.buyLevels = [];
      this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

      // Очищаем данные об установленных лимитках

      const bot = this.bots.find(bot => bot.name === this.botName);

      bot.placedBuyOrdersIds = [];

      bot.placedBuyOrders = [];

      // Ставим новые
      this.initBuyOrders();
      this.setRealBuyOrders();

      // Обновляем график
      //this.updateChart();

      // 3) Выбираем случайный интервал до следующего смещения
      const randomIndex = Math.floor(Math.random() * this.settings.gridShiftIntervals.length);
      const randomInterval = this.settings.gridShiftIntervals[randomIndex];
      this.shiftMeshTimer = setTimeout(this.shiftRealMesh, randomInterval);
      console.log(`Следующее смещение через ${randomInterval} мс`);


      //.then( () => {


      /*}).catch( err => {
        console.log(err);
      });*/


    },

    shiftSimulationMesh() {

      if(!this.tradeTimer) return;
      if(!this.settings) return;
      if(!this.settings.enableGridShift) return;

      console.log("Смещаем сетку в соответствии с текущей ценой...");

      // Стираем старые лимитки с графика
      this.settings.buyLevels = [];
      this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

      // Ставим новые лимитки как при старте
      this.initBuyOrders();

      //this.updateChart();

      // 3) Выбираем случайный интервал до следующего смещения
      const randomIndex = Math.floor(Math.random() * this.settings.gridShiftIntervals.length);
      const randomInterval = this.settings.gridShiftIntervals[randomIndex];
      this.shiftMeshTimer = setTimeout(this.shiftSimulationMesh, randomInterval);
      console.log(`Следующее смещение через ${randomInterval} мс`);

    },

    isPositionLimitReached() {
      if(!this.settings) return;
      return this.settings.openTrades.length + this.settings.buyLevels.length >= this.settings.maxOpenTrades;
    },


    startShiftMeshTimer() {
      if(this.isRealTrade) {
        this.shiftRealMesh();
      } else {
        this.shiftSimulationMesh();
      }
    },

    startTradeTimers() {
      if (this.tradeTimer) return;
      
      console.log("=== START TRADE TIMER ===");

      // Таймер торговли
      this.tradeTimer = setInterval(this.trade, this.settings.interval);

      // Таймер смещения сетки
      this.startShiftMeshTimer();

    },

    stopTradeTimers() {
      if (!this.tradeTimer) return;

      clearInterval(this.tradeTimer);
      this.tradeTimer = null;

      if (this.shiftMeshTimer) {
        clearTimeout(this.shiftMeshTimer);
        this.shiftMeshTimer = null;
      }

      console.log("=== STOP ===");
    },

    initBuyOrders() {

      if(!this.settings) return;

      console.log("Initializing buy orders...");

      if (!this.settings.linesData) {
        this.settings.linesData = []; // Инициализация, если не существует
      }

      this.settings.buyLevels = []; // Сброс существующих уровней
      this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

      for (let i = 1; i <= this.settings.levelsCount; i++) {
        if (this.settings.buyLevels.length >= this.settings.levelsCount) {
          console.log("Превышен лимит лимиток. Новые лимитки не будут выставлены.");
          break;
        }
        if (this.isPositionLimitReached()) {
          console.log("Превышен лимит позиций. Новые позиции не будут выставлены.");
          break;
        }

        const levelPrice = this.settings.currentPrice - i * this.settings.gridStep;

        this.settings.buyLevels.push({
          price: levelPrice,
          volume: this.settings.volume,
        });

        // Выставляем лимитки до симуляции
        this.settings.linesData.push({
          id: "BUY_" + levelPrice,
          price: levelPrice,
          color: "rgba(255,183,77,0.7)",
        });
      }

    },

    trade() {
      if(!this.settings) return;

      this.settings.timeIndex++;

      if(this.isRealTrade) {

        // Здесь необходимо сделать нормировку цены по шагу цены, а пока хардкод 100
        const data = this.dataFabricStore.lastValues.data;
        if(!data) return;

        const bot = this.bots.find(bot => bot.name === this.botName);

        if(data[bot.ticker]){
          const newPrice = data[bot.ticker].oBestBidPrice * 100;
          this.settings.initialPrice = newPrice;
          this.settings.currentPrice = newPrice;

          this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

          this.setRealBuyOrders();
          this.setRealProfitOrders();

        }

      } else {

        const multiplier = (Math.random() - 0.5) * 2 * this.settings.priceStepMultiplier;
        let newPrice = this.settings.currentPrice + this.settings.priceStep * multiplier;

        if(!this.isGenerateData){

          const data = this.dataFabricStore.lastValues.data;
          if(!data) return;

          const bot = this.bots.find(bot => bot.name === this.botName);

          if(data[bot.ticker]){
            newPrice = data[bot.ticker].oBestBidPrice * 100;
            this.settings.initialPrice = newPrice;
          }

        }

        this.settings.currentPrice = this.roundToStep(newPrice, this.settings.priceStep);

        if (this.settings.currentPrice < 0) this.settings.currentPrice = 0;

        this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

        this.setSimulateBuyOrders();
        this.setSimulateprofitLevels();
      }
      //this.updateChart();
    },

    setSimulateBuyOrders() {

      if(!this.settings  || this.isRealTrade) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i];


        // Здеь судя по всему происходит собатиы = "Покупка по уровню сетки"
        if (this.settings.currentPrice <= bo.price) {

          /*if (this.settings.openTrades.length >= this.settings.maxOpenTrades) {
            console.log(`Лимит открытых позиций достигнут: ${this.settings.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }*/

          console.log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);

          //Убираем уровень сработавшей заявки и очищаем горизонтальную линию
          this.settings.buyLevels.splice(i, 1);
          i--;
          this.removeLine("BUY_" + bo.price);

          //Добавляем вертикальную линию выхода из сделки
          this.settings.buyPoints.push({x: this.settings.timeIndex, y: bo.price});

          //Сохраняем в хранилище открытую позицию
          const trade = {
            buyPrice: bo.price,
            volume: bo.volume,
            takeProfit: bo.price + this.settings.takeProfitDistance,
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

    setSimulateprofitLevels() {

      if(!this.settings) return;

      for (let j = 0; j < this.settings.profitLevels.length; j++) {
        const so = this.settings.profitLevels[j];
        if (this.settings.currentPrice >= so.price) {
          console.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);


          this.settings.profitLevels.splice(j, 1);
          j--;
          this.removeLine("SELL_" + so.price);

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

            // Восстановление лимитки (если включено)
            if (this.settings.enableRestore && this.settings.remainingRestoreCount > 0) {
              if (this.isPositionLimitReached()) {
                console.log("Превышен лимит позиций и лимиток. Восстановление отменено.");
                return;
              }
              // Новая проверка: лимит лимиток
              if (this.settings.buyLevels.length >= this.settings.levelsCount) {
                console.log("Превышен лимит лимиток. Восстановление отменено.");
                continue;
              }

              this.settings.buyLevels.push({
                price: tr.buyPrice,
                volume: this.settings.volume,
              });
              this.settings.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "rgba(255,183,77,0.7)",
              });
              this.settings.remainingRestoreCount--;
              console.log(
                  `Restored BUY limit @${tr.buyPrice.toFixed(
                      2
                  )}. Remaining: ${this.settings.remainingRestoreCount}`
              );
            }
          }

        }
      }
    },

    setRealBuyOrders() {

      if(!this.settings) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i]

        const bot = this.bots.find(bot => bot.name === this.botName);

        const isOrderAlreadyPlaced = bot.placedBuyOrders.includes(bo.price);

        if (this.settings.openTrades.length >= this.settings.maxOpenTrades) {
          console.log(`Лимит открытых позиций достигнут: ${this.settings.maxOpenTrades}`);
          return; // Останавливаем добавление новых сделок
        }

        if (this.settings.currentPrice >= bo.price && !isOrderAlreadyPlaced) {
          console.log('Set buy limit, current price', this.settings.currentPrice/100, ', Buy Level price', bo.price/100, ', Volume', bo.volume);

          const bot = this.bots.find(bot => bot.name === this.botName);
          this.ordersStore.sendLimitBuyOrder(1, bo.price/100, bot.ticker, 'MOEX', 'buy', 'D88141', bot.name );

          bot.placedBuyOrders.push(bo.price);

          // Удаляем линии чтобы повторно не отправлять
          this.settings.buyLevels.splice(i, 1);
          i--;

          // Помечаем цветом pending (вроде необязательно)
          const lineIndex = this.settings.linesData.findIndex(line => line.id === "BUY_" + bo.price);
          if (lineIndex !== -1) {
            this.settings.linesData[lineIndex].pending = true;
            this.settings.linesData[lineIndex].color = "rgba(0, 0, 255, 0.7)"; // синий цвет для ожидающей заявки
          }
        }

      }
    },

    // Метод для выставления лимитного ордера на профит (sell order)
    // Он вызывается автоматически после исполнения входной лимитки
    setRealProfitOrders() {
      if (!this.settings) return;
      for (let j = 0; j < this.settings.profitLevels.length; j++) {
        const so = this.settings.profitLevels[j];
        const bot = this.bots.find(bot => bot.name === this.botName);
        const isProfitAlreadyPlaced = bot.placedProfitOrders && bot.placedProfitOrders.includes(so.price);
        if (this.settings.currentPrice >= so.price && !isProfitAlreadyPlaced) {
          console.log('Placing real profit (sell) order at', so.price);
          this.ordersStore.sendLimitOrder(1, so.price / 100, bot.ticker, 'MOEX', 'sell', 'D88141', bot.name );
          if (!bot.placedProfitOrders) {
            bot.placedProfitOrders = [];
          }
          bot.placedProfitOrders.push(so.price);
          // Отмечаем линию лимитки профита как pending
          const lineIndex = this.settings.linesData.findIndex(line => line.id === "SELL_" + so.price);
          if (lineIndex !== -1) {
            this.settings.linesData[lineIndex].pending = true;
            this.settings.linesData[lineIndex].color = "rgba(255, 0, 0, 0.7)"; // красный для ожидающей заявки
          }
        }
      }
    },

    /*setRealProfitOrders() {

      if(!this.settings) return;

      for (let j = 0; j < this.settings.profitLevels.length; j++) {

        const so = this.settings.profitLevels[j];

        const bot = this.bots.find(bot => bot.name === this.botName);

        const isProfitAlreadyPlaced = bot.placedProfitOrders.includes(so.price);

        if (this.settings.currentPrice >= so.price) {
          console.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);


          this.settings.profitLevels.splice(j, 1);
          j--;
          this.removeLine("SELL_" + so.price);

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

            // Восстановление лимитки (если включено)
            if (this.settings.enableRestore && this.settings.remainingRestoreCount > 0) {
              if (this.isPositionLimitReached()) {
                console.log("Превышен лимит позиций и лимиток. Восстановление отменено.");
                return;
              }
              // Новая проверка: лимит лимиток
              if (this.settings.buyLevels.length >= this.settings.levelsCount) {
                console.log("Превышен лимит лимиток. Восстановление отменено.");
                continue;
              }

              this.settings.buyLevels.push({
                price: tr.buyPrice,
                volume: this.settings.volume,
              });
              this.settings.linesData.push({
                id: "BUY_" + tr.buyPrice,
                price: tr.buyPrice,
                color: "rgba(255,183,77,0.7)",
              });
              this.settings.remainingRestoreCount--;
              console.log(
                  `Restored BUY limit @${tr.buyPrice.toFixed(
                      2
                  )}. Remaining: ${this.settings.remainingRestoreCount}`
              );
            }
          }

        }

        if (this.settings.currentPrice >= so.price && !isProfitAlreadyPlaced) {
          console.log('Set profit limit, current price', this.settings.currentPrice/100, ', Buy Level price', so.price/100, ', Volume', so.volume);

          this.ordersStore.sendLimitBuyOrder(1, so.price/100, bot.ticker, 'MOEX', 'sell', 'D88141', bot.name );

          bot.placedProfitOrders.push(so.price);

          /!* console.log('Set profit limit, current price', this.settings.currentPrice/100, ', Buy Level price', bo.price/100, ', Volume', bo.volume);

          const bot = this.bots.find(bot => bot.name === this.botName);
          this.ordersStore.sendLimitBuyOrder(1, bo.price/100, bot.ticker, 'MOEX', 'buy', 'D88141', bot.name );

          bot.placedBuyOrders.push(bo.price);*!/
        }
      }
    },*/

    resetState() {
      console.log("Сброс состояния вызван!");

      if (this.meshbotStore.activeBotIndex === null || !this.meshbotStore.bots[this.meshbotStore.activeBotIndex]) {
        console.warn("Активный бот не найден. Сброс состояния не выполнен.");
        return;
      }

      const bot = this.bots.find(bot => bot.name === this.botName);

      const botSettings = bot.settings;

      //console.log('Bot Settings', botSettings);

      Object.assign(botSettings, {
        currentPrice: botSettings.initialPrice,
        timeIndex: 0,
        buyLevels: [],
        profitLevels: [],
        openTrades: [],
        closedTrades: [],
        totalProfit: 0,
        priceData: [],
        linesData: [],
        buyPoints: [],
        sellPoints: [],
        remainingRestoreCount: botSettings.restoreCount,
      });

      botSettings.priceData.push(
          { x: 0, y: botSettings.initialPrice },
          { x: 1, y: botSettings.initialPrice }
      );

      this.initBuyOrders();

      //this.updateChart();

      console.log("Состояние сброшено.");
    },

    deleteBot(){
      this.$emit('delete-bot');
    },

    toggleBlock(blockId) {
      this.meshbotStore.visibilityState[blockId] = !this.meshbotStore.visibilityState[blockId];
    },

    roundToStep(value, step) {
      return Math.floor(value / step + 0.5) * step;
    },

  },

  mounted() {
    this.resetState();
  },


  watch: {
    // При получении сигнала от родителя (например, остановка бота)
    stopBotFromParentIndex() {
      this.stopTradeTimers();
    },
    // Отслеживание изменений в ordersStore.limitOrders для обновления статусов ордеров
    /*'ordersStore.limitOrders': {
      handler(newOrders) {
        console.log('WATCHER NEW ORDERS', newOrders);
        newOrders.forEach(order => {
          if (order.data.botId === this.botName) {
            const orderPrice = order.data.price * 100;

            // Обработка ордеров на покупку (buy orders)
            if (order.data.side === 'buy') {
              if (order.data.status === 'filled') {
                console.log(`Buy order filled at ${orderPrice}`);
                this.removeLine("BUY_" + orderPrice);
                this.settings.buyPoints.push({ x: this.settings.timeIndex, y: orderPrice });

                // Выставляем лимитку на профит
                const profitPrice = orderPrice + this.settings.takeProfitDistance;
                if (!this.settings.profitLevels.find(p => p.price === profitPrice)) {
                  this.settings.profitLevels.push({
                    price: profitPrice,
                    volume: this.settings.volume,
                    linkBuy: orderPrice
                  });
                  this.settings.linesData.push({
                    id: "SELL_" + profitPrice,
                    price: profitPrice,
                    color: "rgba(255,183,77,0.7)"
                  });
                }
              } else if (order.data.status === 'canceled') {
                console.log(`Buy order canceled at ${orderPrice}`);
                this.removeLine("BUY_" + orderPrice);

                // Опционально: вернуть лимитку на покупку в список buyLevels
                if (!this.settings.buyLevels.find(b => b.price === orderPrice)) {
                  this.settings.buyLevels.push({ price: orderPrice, volume: 1 });
                  this.settings.linesData.push({
                    id: "BUY_" + orderPrice,
                    price: orderPrice,
                    color: "rgba(255,183,77,0.7)"
                  });
                }
              }
            }

            // Обработка профитных лимиток (sell orders)
            if (order.data.side === 'sell') {
              if (order.data.status === 'filled') {
                console.log(`Sell order filled at ${orderPrice}`);
                this.removeLine("SELL_" + orderPrice);
                this.settings.sellPoints.push({ x: this.settings.timeIndex, y: orderPrice });
              } else if (order.data.status === 'canceled') {
                console.log(`Sell order canceled at ${orderPrice}`);
                this.removeLine("SELL_" + orderPrice);

                // Опционально: вернуть лимитку на профит
                if (!this.settings.profitLevels.find(p => p.price === orderPrice)) {
                  this.settings.profitLevels.push({
                    price: orderPrice,
                    volume: this.settings.volume,
                    linkBuy: null
                  });
                  this.settings.linesData.push({
                    id: "SELL_" + orderPrice,
                    price: orderPrice,
                    color: "rgba(255,183,77,0.7)"
                  });
                }
              }
            }
          }
        });
      },
      deep: true
    },*/
    'ordersStore.limitOrders': {
      handler(newOrders) {
        console.log('WATCHER NEW ORDERS', newOrders);
        newOrders.forEach(order => {
          if (order.data.botId === this.botName) {
            const orderPrice = order.data.price * 100;

            // Обработка для buy-ордеров
            if (order.data.side === 'buy') {
              if (order.data.status === 'filled') {
                console.log(`Buy order filled at ${orderPrice}`);
                this.removeLine("BUY_" + orderPrice);
                this.settings.buyPoints.push({ x: this.settings.timeIndex, y: orderPrice });

                // Рассчитываем цену профитного ордера
                const profitPrice = orderPrice + this.settings.takeProfitDistance;

                // Проверяем, нет ли уже ордера на этот уровень профита
                if (!this.settings.profitLevels.find(p => p.price === profitPrice)) {
                  // Добавляем уровень профита
                  this.settings.profitLevels.push({
                    price: profitPrice,
                    volume: this.settings.volume,
                    linkBuy: orderPrice
                  });

                  // Рисуем горизонтальную линию профитного ордера на графике
                  this.settings.linesData.push({
                    id: "SELL_" + profitPrice,
                    price: profitPrice,
                    color: "rgba(255,183,77,0.7)"
                  });

                  // Отправляем реальный лимитный ордер на продажу
                  this.ordersStore.sendLimitBuyOrder(
                      this.settings.volume,
                      profitPrice / 100,
                      order.data.ticker,
                      'MOEX',
                      'sell',                // направление меняем на 'sell'
                      'D88141',
                      this.botName
                  );
                }
              }
            }

            // Обработка профитных sell-ордеров
            if (order.data.side === 'sell') {
              if (order.data.status === 'filled') {
                console.log(`Sell order filled at ${orderPrice}`);
                this.removeLine("SELL_" + orderPrice);
                this.settings.sellPoints.push({ x: this.settings.timeIndex, y: orderPrice });
              }
            }
          }
        });
      },
      deep: true
    },
  },

  computed: {
    bots() {
      return this.meshbotStore.bots;
    },
    currentBotString() {
      const bot = this.bots.find(bot => bot.name === this.botName);
      return JSON.stringify(bot, null, 2);
    },
    currentBot() {
      return this.meshbotStore.bots[this.meshbotStore.activeBotIndex];
    },
    settings() {
      if(this.botId !== null && this.botId !== undefined){
        return this.meshbotStore.bots[this.botId].settings;
      } else {
        return null
      }
    },
    remainingBuyLimits() {
      if(this.settings){
        return Math.max(this.settings.maxOpenTrades - this.settings.openTrades.length, 0);
      } else {
        return null;
      }
    },
  }
};
</script>

