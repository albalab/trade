<template>
  <div class="meshbot-simulator">

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
              Удалить «{{currentBot.name}}»
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
            :sellOrders="settings.sellOrders"
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
import ChartComponent from './ChartComponent.vue';

import {sendGroupLimitOrders, cancelGroupOrders, cancelAllOrders } from "@/services/LimitOrderService";


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
      
      isGenerateData: true,
      isRealTrade: false,

      forwardPadding: 10,

      displayMode: "all",
      latestWindowSize: 100,

      shiftMeshTimer: null,

    };
  },

  methods: {

    async sendGroupLimitOrders(orders) {
      try {
        const result = await sendGroupLimitOrders(orders);

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
    },

    async cancelAllOrders() {
      try {
        const exchange = 'MOEX'; // Укажите биржу
        const portfolio = 'D88141'; // Укажите портфель
        await cancelAllOrders(exchange, portfolio).then(() => {
          this.ordersStore.limitOrders = [];
        });

        //console.log("Все ордера успешно отменены:", result);
      } catch (error) {
        console.error("Ошибка при отмене всех ордеров:", error.message);
      }
    },

    async cancelGroupOrders(orderIds) {
      try {
        const params = {
          orderIds: orderIds,
          portfolio: "D88141",
          exchange: "MOEX",
          stop: false,
        };

        const response = await cancelGroupOrders(params);

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
    },

    removeLine(id) {
      const idx = this.settings.linesData.findIndex(l => l.id === id);
      if (idx >= 0) {
        this.settings.linesData.splice(idx, 1);
      }
    },

    shiftRealMesh() {

      if(!this.tradeTimer) return;
      if(!this.settings) return;
      if(!this.settings.enableGridShift) return;

      console.log("Смещаем сетку в соответствии с текущей ценой...");

      // Отменяем реальные лимитки
      this.cancelAllOrders()
          .then( () => {

            // Стираем старые лимитки с графика
            this.settings.buyLevels = [];
            this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

            // Очищаем данные об установленных лимитках
            this.settings.placedBuyOrders = [];


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


          }).catch( error => {
        console.log(error);
      });

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
        const newPrice = this.dataFabricStore.lastValues.data?.MTLR.oBestBidPrice * 100;
        this.settings.initialPrice = newPrice;
        this.settings.currentPrice = newPrice;

        this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

        this.setRealBuyOrders();
        this.setRealSellOrders();

      } else {

        const multiplier = (Math.random() - 0.5) * 2 * this.settings.priceStepMultiplier;
        let newPrice = this.settings.currentPrice + this.settings.priceStep * multiplier;

        if(!this.isGenerateData){
          newPrice = this.dataFabricStore.lastValues.data?.MTLR.oBestBidPrice * 100;
          this.settings.initialPrice = newPrice;
        }

        this.settings.currentPrice = this.roundToStep(newPrice, this.settings.priceStep);

        if (this.settings.currentPrice < 0) this.settings.currentPrice = 0;

        this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

        this.setSimulateBuyOrders();
        this.setSimulateSellOrders();
      }
      //this.updateChart();
    },

    setSimulateBuyOrders() {

      if(!this.settings) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i];


        if (this.settings.currentPrice <= bo.price) {
          if (this.settings.openTrades.length >= this.settings.maxOpenTrades) {
            console.log(`Лимит открытых позиций достигнут: ${this.settings.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }

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
          this.settings.sellOrders.push(so);

          this.settings.linesData.push({
            id: "SELL_" + so.price,
            price: so.price,
            color: "#9B67DB",
          });

        }

      }
    },

    setSimulateSellOrders() {

      if(!this.settings) return;

      for (let j = 0; j < this.settings.sellOrders.length; j++) {
        const so = this.settings.sellOrders[j];
        if (this.settings.currentPrice >= so.price) {
          console.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);


          this.settings.sellOrders.splice(j, 1);
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
      // суть проблемы в том, что trade вызывается каждый тик, есть массив с уровнями по которым должны быть выставлены лимитки,
      // а есть реальные лимитки на сервере. Так вот если уже поставили лимитки, тогда новые по этим ценам ставить не надо!

      if(!this.settings) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i]

        const isOrderAlreadyPlaced = this.settings.placedBuyOrders.includes(bo.price);

        if (this.settings.openTrades.length >= this.settings.maxOpenTrades) {
          console.log(`Лимит открытых позиций достигнут: ${this.settings.maxOpenTrades}`);
          return; // Останавливаем добавление новых сделок
        }

        if (this.settings.currentPrice >= bo.price && !isOrderAlreadyPlaced) {
          console.log('Set buy limit, current price', this.settings.currentPrice/100, ', Buy Level price', bo.price/100, ', Volume', bo.volume);

          const order =  {
              side: "buy",
              quantity: 1,
              price: bo.price/100,
              instrument: {
                symbol: "MTLR",
                exchange: "MOEX",
                instrumentGroup: "TQBR",
              },
              user: {
                portfolio: "D88141",
              },
              timeInForce: "oneday",
            };

          this.sendGroupLimitOrders([order]);

          this.settings.placedBuyOrders.push(bo.price);

          //console.log('Set buy limit, ', 'price', bo.price / 100, ', volume', bo.volume);
        }

      }
    },

    setRealSellOrders() {

      if(!this.settings) return;

      for (let j = 0; j < this.settings.sellOrders.length; j++) {
        const so = this.settings.sellOrders[j];
        if (this.settings.currentPrice >= so.price) {
          console.log(`EXEC SELL @${so.price.toFixed(2)}, vol=${so.volume}`);


          this.settings.sellOrders.splice(j, 1);
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

    resetState() {
      console.log("Сброс состояния вызван!");

      if (this.meshbotStore.activeBotIndex === null || !this.meshbotStore.bots[this.meshbotStore.activeBotIndex]) {
        console.warn("Активный бот не найден. Сброс состояния не выполнен.");
        return;
      }

      const botSettings = this.meshbotStore.bots[this.meshbotStore.activeBotIndex].settings;

      //console.log('Bot Settings', botSettings);

      Object.assign(botSettings, {
        currentPrice: botSettings.initialPrice,
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
    stopBotFromParentIndex() {
      this.stopTradeTimers();
    },
  },

  computed: {
    currentBotString() {
      return JSON.stringify(this.currentBot, null, 2);
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

