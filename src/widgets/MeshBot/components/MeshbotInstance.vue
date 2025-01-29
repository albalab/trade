<template>
  <div class="meshbot-simulator">

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleBlock('block1')">
        <h2 class="title">
          <i  v-if="visibilityState['block1']" class="fal fa-chevron-down"></i>
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

      <div class="section-settings" v-show="visibilityState.block1">
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
          <i v-if="visibilityState['block2']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Данные
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
            <input type="number" v-model.number="settings.initialPrice" step="1" @change="resetState()"/>

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
          <i v-if="visibilityState['block3']"  class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Торговля
        </h2>
      </div>

      <div v-show="visibilityState.block3">
        <div class="mesh-simulation-buttons" style="position: relative;">
          <button class="btn" @click="!isTrading ? startTrade() : stopTrade()">
            <i class="fal" :class="{'fa-pause': isTrading, 'fa-play': !isTrading}"></i>
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

        <div class="chart">
          <canvas ref="chartCanvas" width="600" height="300"></canvas>
        </div>
      </div>
    </div>





<!--    <div class="meshbot-section">
      <div class="meshbot-section-header"
           @click="toggleBlock('block8')">
        <h2 class="title">
          <i v-if="visibilityState['block8']"
             class="fal fa-chevron-down"></i>
          <i v-else  class="fal fa-chevron-right"></i>
          Простейшая торговля
        </h2>
      </div>
      <div v-show="visibilityState['block8']">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 20px; padding: 20px;">

          &lt;!&ndash;CREATE GROUP ORDERS&ndash;&gt;
          <div>
            <ul>
              <li v-for="(order, index) in groupOrders" :key="index" style="margin: 0 0 10px;">
                <div v-if="order.price">
                  {{ index + 1 }}. {{ order.side }} {{ order.quantity }} {{ order.instrument.symbol }} по {{ order.price }} {{ order.user.portfolio }}
                </div>
              </li>
            </ul>

            <button class="btn"
                    @click="sendGroupLimitOrders(templateGroupOrders)">
              Создать лимитки
            </button>

            <div style="padding-top: 6px;">
              <label class="checkbox-label" style="display: inline-block; padding-left: 21px; padding-top: 1px;">
                <input v-model="isTimerRunning" @change="toggleTimer" class="checkbox" type="checkbox" style="top: 0;"/>
                Автомат с интервалом
              </label>

              <span style=" padding-left: 8px;">
                <input v-model="count" style="width: 20px;"/> сек
              </span>
            </div>
          </div>

          &lt;!&ndash; ACTIVE ORDERS &ndash;&gt;
          <div>
            <div class="limit-orders">
              <div class="limit-orders-head"
                   v-if="ordersStore.limitOrders.length"
                   style="position: relative; min-height: 10px;">
                <label class="checkbox-label">
                  <input
                      style="top: 4px; position: absolute;"
                      class="checkbox"
                      type="checkbox"
                      :checked="areAllSelected"
                      @change="toggleAll($event)"
                  />
                  <div style="padding: 4px 0 4px 20px;">Выбрать все</div>
                </label>
                <div @click="cancelAllOrders()"
                     class="close-order">
                  <i class="fat fa-xmark"></i>
                </div>
              </div>
              <div
                  v-for="item in ordersStore.limitOrders"
                  :key="item.data.id"
                  class="limit-orders-row"
              >
                <div class="limit-order">
                  <label class="checkbox-label">

                    <div class="limit-order-row">

                      <div>
                        <input
                            class="checkbox"
                            type="checkbox"
                            :value="item.data?.orderNumber"
                            v-model="selectedOrders"
                        />
                      </div>

                      <div>
                        {{ item?.data?.symbol }}
                      </div>

                      <div style="white-space: nowrap;">
                        {{item.data.volume}} руб
                      </div>

                      <div style="padding: 0 20px; white-space: nowrap;">
                        {{item.data.qty}} шт
                      </div>
                    </div>

                  </label>
                </div>
                <div class="close-button">
                  <button @click="cancelOrders([item.data?.orderNumber])">
                    <i class="fat fa-xmark" style="font-size: 12px"></i>
                  </button>
                </div>
              </div>

              <div v-if="ordersStore.limitOrders.length"
                   class="limit-orders-buttons">
                <button class="btn"
                        :class="{'disabled': selectedOrders.length === 0}"
                        @click="(selectedOrders.length > 0) ? cancelOrders(selectedOrders) : null">
                  Снять
                </button>
              </div>

              <div style="padding-top: 6px;">
                <label class="checkbox-label" style="display: inline-block; padding-left: 21px; padding-top: 1px;">
                  <input v-model="isTimerRunning2" @change="toggleTimer2" class="checkbox" type="checkbox" style="top: 0;"/>
                  Автомат с интервалом
                </label>

                <span style=" padding-left: 8px;">
                  <input v-model="count2" style="width: 20px;"/> сек
                </span>
              </div>

            </div>
          </div>

          &lt;!&ndash;ACTIVE POSITIONS&ndash;&gt;
          <div>
            &lt;!&ndash;    <button class="btn" @click="fetchPositions2">
      Загрузить позиции
    </button>&ndash;&gt;

            <div v-for="p in ordersStore.activePositions" :key="p.guid" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; white-space: nowrap;">
              <span>{{p.symbol}} </span>
              <strong>{{p.volume.toFixed(2)}} руб</strong>
              <span style="margin-left: 10px;">{{p.qtyUnits}} шт</span>


              &lt;!&ndash;this.dataFabricStore.lastValues.data?.MTLR.oBestBidPrice&ndash;&gt;

              <span v-if="this.orderbooksStore.orderbooksMetrics">
                <strong v-if="this.orderbooksStore.orderbooksMetrics[p.symbol]" style="margin-left: 10px;">
                    {{((this.orderbooksStore.orderbooksMetrics[p.symbol]?.orderbookBestAskPrice * p.qtyUnits) - p.volume).toFixed(2)}} руб
                </strong>&lt;!&ndash;{{p.qtyUnits}}, {{p.avgPrice}}<br>&ndash;&gt;
              </span>

            </div>

          </div>


        </div>
      </div>
    </div>-->

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
            :buyLevels="settings.buyLevels"
            :sellOrders="settings.sellOrders"
            :openTrades="settings.openTrades"
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
          :closedTrades="settings.closedTrades"
          :totalProfit="settings.totalProfit"
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
          :remainingRestoreCount="settings.remainingRestoreCount"
      />
    </div>

  </div>
</template>

<script>

import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';
import {sendGroupLimitOrders, cancelGroupOrders, cancelAllOrders } from "@/modules/LimitOrderModule";


import { useDataFabricStore } from '@/stores/dataFabricStore';
import OrdersComponent from "@/widgets/MeshBot/components/OrdersComponent.vue";
import HistoryComponent from "@/widgets/MeshBot/components/HistoryComponent.vue";
import LogComponent from "@/widgets/MeshBot/components/LogComponent.vue";

import { markRaw, toRaw } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

import zoomPlugin from 'chartjs-plugin-zoom';
import {useBotsStore} from "@/stores/botsStore";

Chart.register(zoomPlugin);



export default {
  name: "MeshbotInstance",

  components: {
    OrdersComponent,
    HistoryComponent,
    LogComponent,
  },

  setup() {

    const ordersStore = useOrdersStore();
    const orderbooksStore = useOrderbooksStore();

    const dataFabricStore = useDataFabricStore();
    const botsStore = useBotsStore();

    return {
      botsStore,
      orderbooksStore,
      ordersStore,
      dataFabricStore,
    }

  },

  props: {
    stopBotSimulationIndex: Number,
    botId: Number,
  },

  data() {
    return {

      placedBuyOrders: [],

      realOrders: [], // массив, который будет хранить реальные ордера
      isRealTradeActive: false, // флаг реальной торговли

      //CREATE GROUP ORDERS

      defaultCount: 7,
      count: 7,
      isTimerRunning: false,

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


      //ACTIVE ORDERS
      defaultCount2: 11,
      count2: 11,
      isTimerRunning2: false,

      selectedOrders: [],











      tradingId: null,
      
      isGenerateData: false,
      isRealTrade: true,

      //isRealPrice: true,

      visibilityState: {
        block1: true,
        block2: true,
        block3: true,
        block4: true,
        block5: true,
        block6: true,
        block7: true,
        block8: true,
      },

      forwardPadding: 10,

      displayMode: "all", // Режим отображения графика
      latestWindowSize: 100,

      isTrading: false,

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

      /*botsStore:{
        remainingRestoreCount: 0,
        currentPrice: 100,
        tradingId: null,
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
                orderNumber: order.data.orderNumber,
                side: originalOrder.side,
                quantity: originalOrder.quantity,
                price: originalOrder.price,
                symbol: originalOrder.instrument.symbol,
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

    startTimer() {
      const updateTimer = () => {
        if (!this.isTimerRunning) {
          clearTimeout(this.timerId); // Остановить таймер, если флаг false
          return;
        }

        this.count = this.count > 0 ? this.count - 1 : this.defaultCount;
        if (this.count === 0) {
          this.sendGroupLimitOrders(this.templateGroupOrders);
        }

        // Планируем следующий вызов через 1 секунду
        this.timerId = setTimeout(updateTimer, 1000);
      };

      // Запускаем таймер, если флаг true
      if (this.isTimerRunning) {
        updateTimer();
      }
    },

    toggleTimer() {
      if (this.isTimerRunning) {
        // Если таймер включён, запускаем его с задержкой 5 секунд
        setTimeout(() => {
          if (this.isTimerRunning) this.startTimer();
        }, 1000);
      } else {
        // Если таймер выключен, останавливаем его
        clearTimeout(this.timerId);
        this.timerId = null;
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

    toggleAll(event) {
      if (event.target.checked) {
        this.selectedOrders = this.ordersStore.limitOrders.map(
            (item) => item.data.orderNumber
        );
      } else {
        this.selectedOrders = [];
      }
    },

    async cancelOrders(orderIds) {
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


    startTimer2() {
      const updateTimer = () => {
        if (!this.isTimerRunning2) {
          clearTimeout(this.timerId); // Остановить таймер, если флаг false
          return;
        }

        this.count2 = this.count2 > 0 ? this.count2 - 1 : this.defaultCount2;
        if (this.count2 === 0) {
          this.cancelAllOrders();
        }

        // Планируем следующий вызов через 1 секунду
        this.timerId = setTimeout(updateTimer, 1000);
      };

      // Запускаем таймер, если флаг true
      if (this.isTimerRunning2) {
        updateTimer();
      }
    },

    toggleTimer2() {
      if (this.isTimerRunning2) {
        // Если таймер включён, запускаем его с задержкой 5 секунд
        setTimeout(() => {
          if (this.isTimerRunning2) this.startTimer2();
        }, 1000);
      } else {
        // Если таймер выключен, останавливаем его
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    },


    toggleRealTrade() {

    },

    deleteBot(){
      this.$emit('delete-bot');
    },

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

    async placeRealBuyOrder(price, volume) {
      // Нормализуем цену согласно настройкам
      const normalizedPrice = this.normalizePrice(price);
      const normalizedVolume = this.normalizeVolume(volume);

      // Используем существующий API метод для размещения лимитного ордера
      const order = {
        symbol: "MTLR", // Пример символа, замените на необходимый
        side: "buy",
        quantity: normalizedVolume,
        price: normalizedPrice,
        timeInForce: "GTC", // Или другие необходимы параметры
      };
      // Вызов API метода размещения ордера
      const response = await sendGroupLimitOrders([order]); // Предполагается, что sendGroupLimitOrders может принимать массив ордеров

      if (response.data && response.data.length > 0 && response.data[0].data?.orderNumber) {
        return response.data[0].data;
      } else {
        throw new Error("Не удалось разместить реальный BUY ордер.");
      }
    },

    async cancelRealSellOrder(orderId) {
      // Используем существующий API метод для отмены ордера
      await this.cancelOrders([orderId]);
    },

    normalizePrice(price) {
      if (!this.settings || !this.settings.priceStep) return price;
      return Math.round(price / this.settings.priceStep);
    },

    removeLine(id) {
      const idx = this.settings.linesData.findIndex(l => l.id === id);
      if (idx >= 0) {
        this.settings.linesData.splice(idx, 1);
      }
    },

    updateChart() {

      if(!this.settings) return;
      if (!this.chartInstance) return;

      const rawPriceData = toRaw(this.settings.priceData);
      const rawLines = toRaw(this.settings.linesData);
      //const allPrices = rawPriceData.map(p => p.y);
      const buyPrices = this.settings.buyLevels.map(level => level.price);
      const sellPrices = this.settings.sellOrders.map(order => order.price);

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

      //console.log("LinesData:", this.settings.linesData);

      // Отображение линий с разными цветами
      const linesPoints = [];
      for (const line of rawLines) {
        linesPoints.push({ x: 0, y: line.price, customColor: line.color });
        linesPoints.push({
          x: this.settings.timeIndex + 5,
          y: line.price,
          customColor: line.color,
        });
        linesPoints.push({ x: null, y: null });
      }

      // Добавляем линию текущей цены
      linesPoints.push({ x: 0, y: this.settings.currentPrice, customColor: "white" });
      linesPoints.push({
        x: this.settings.timeIndex + 5,
        y: this.settings.currentPrice,
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
      for (const bp of toRaw(this.settings.buyPoints)) {
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
      for (const sp of toRaw(this.settings.sellPoints)) {
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

    shiftRealMesh() {

      if(!this.isTrading) return;
      if(!this.settings) return;
      if(!this.settings.enableGridShift) return;

      console.log("Смещаем сетку в соответствии с текущей ценой...");

      // Отменяем реальные лимитки
      this.cancelAllOrders().then( () => {

        // Стираем старые лимитки с графика
        this.settings.buyLevels = [];
        this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

        // Очищаем данные об установленных лимитках
        this.placedBuyOrders = [];

        // Ставим новые
        //this.setRealBuyOrders();

        // Обновляем график
        this.updateChart();

        // 3) Выбираем случайный интервал до следующего смещения
        const randomIndex = Math.floor(Math.random() * this.settings.gridShiftIntervals.length);
        const randomInterval = this.settings.gridShiftIntervals[randomIndex];
        this.shiftMeshTimer = setTimeout(this.shiftSimulationMesh, randomInterval);
        console.log(`Следующее смещение через ${randomInterval} мс`);

      }).catch( err => {
        console.log(err);
      });


    },

    shiftSimulationMesh() {

      if(!this.isTrading) return;
      if(!this.settings) return;
      if(!this.settings.enableGridShift) return;

      console.log("Смещаем сетку в соответствии с текущей ценой...");

      // Стираем старые лимитки с графика
      this.settings.buyLevels = [];
      this.settings.linesData = this.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

      // Ставим новые лимитки как при старте
      this.initBuyOrders();

      this.updateChart();

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

    startTrade() {
      if (this.tradingId) {
        console.log("Симуляция уже идёт!");
        return;
      }
      console.log("=== START ===");

      this.isTrading = true;

      // Таймер торговли
      this.tradingId = setInterval(this.trade, this.settings.interval);

      // Таймер смещения сетки
      if(this.isRealTrade) {
        this.shiftRealMesh();
      } else {
        this.shiftSimulationMesh();
      }
    },

    stopTrade() {
      if (!this.tradingId) {
        console.log("Симуляция не запущена!");
        return;
      }

      this.isTrading = false;

      clearInterval(this.tradingId);
      this.tradingId = null;

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

    realTrade() {
      this.settings.timeIndex++;

      // Здесь необходимо сделать нормировку цены - хардкод 100
      const newPrice = this.dataFabricStore.lastValues.data?.MTLR.oBestBidPrice * 100;
      this.settings.initialPrice = newPrice;
      this.settings.currentPrice = newPrice;

      this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

      this.setRealBuyOrders();
      this.setRealSellOrders();

      this.updateChart();
    },

    simulateTrade() {
      this.settings.timeIndex++;

      // Генерируем случайный множитель шага: положительный или отрицательный
      const multiplier = (Math.random() - 0.5) * 2 * this.settings.priceStepMultiplier;
      //const multiplier = (Math.random() > 0.5 ? 1 : -1) * this.settings.priceStepMultiplier;

      let newPrice = this.settings.currentPrice + this.settings.priceStep * multiplier;

      if(!this.isGenerateData){
        newPrice = this.dataFabricStore.lastValues.data?.MTLR.oBestBidPrice * 100;
        this.settings.initialPrice = newPrice;
      }

      //console.log(newPrice);

      //this.settings.currentPrice += delta;

      // Применяем минимальный шаг
      this.settings.currentPrice = this.roundToStep(newPrice, this.settings.priceStep);

      if (this.settings.currentPrice < 0) this.settings.currentPrice = 0.1;

      this.settings.priceData.push({ x: this.settings.timeIndex, y: this.settings.currentPrice });

      this.setBuyOrders();
      this.setSellOrders();

      this.updateChart();
    },

    trade() {
      if(!this.settings) return;

      if(this.isRealTrade) {
        this.realTrade();
      } else {
        this.simulateTrade();
      }
      
    },

    setBuyOrders() {

      if(!this.settings) return;

      for (let i = 0; i < this.settings.buyLevels.length; i++) {

        const bo = this.settings.buyLevels[i];


        if (this.settings.currentPrice <= bo.price) {
          if (this.settings.openTrades.length >= this.settings.maxOpenTrades) {
            console.log(`Лимит открытых позиций достигнут: ${this.settings.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }

          console.log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);

          this.settings.buyLevels.splice(i, 1);
          i--;
          this.removeLine("BUY_" + bo.price);

          this.settings.buyPoints.push({x: this.settings.timeIndex, y: bo.price});

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

    setSellOrders() {

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

        const isOrderAlreadyPlaced = this.placedBuyOrders.includes(bo.price);

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

          this.placedBuyOrders.push(bo.price);

          //console.log('Set buy limit, ', 'price', bo.price / 100, ', volume', bo.volume);
        }


        /*

        if (this.settings.currentPrice <= bo.price) {
          if (this.settings.openTrades.length >= this.settings.maxOpenTrades) {
            console.log(`Лимит открытых позиций достигнут: ${this.settings.maxOpenTrades}`);
            return; // Останавливаем добавление новых сделок
          }

          console.log(`EXEC BUY @${bo.price.toFixed(2)}, vol=${bo.volume}`);

          this.settings.buyLevels.splice(i, 1);
          i--;
          this.removeLine("BUY_" + bo.price);

          this.settings.buyPoints.push({x: this.settings.timeIndex, y: bo.price});

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
*/
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

      if (this.botsStore.activeBotIndex === null || !this.botsStore.bots[this.botsStore.activeBotIndex]) {
        console.warn("Активный бот не найден. Сброс состояния не выполнен.");
        return;
      }

      const botSettings = this.botsStore.bots[this.botsStore.activeBotIndex].settings;

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

      this.updateChart();

      console.log("Состояние сброшено.");
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
              maintainAspectRatio: true,
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
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        // Убираем разделители тысяч в подсказках
                        label += context.parsed.y.toLocaleString('ru-RU', { useGrouping: false });
                      }
                      return label;
                    }
                  }
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
                  ticks: {
                    // Убираем разделители тысяч на оси Y
                    callback: function(value) {
                      return value.toLocaleString('ru-RU', { useGrouping: false });
                    }
                  }
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

  mounted() {

    this.initChartInstance();

    this.resetState();

    window.addEventListener("resize", this.updateChartSize);

  },

  unmounted() {
    this.destroyChartInstance();
    window.removeEventListener("resize", this.updateChartSize);
  },

  watch: {

    stopBotSimulationIndex() {
      this.stopTrade();
    },

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
          if(this.settings){
            if (this.chartInstance && this.settings.priceData.length > 0) {
              this.updateChart();
            }
          }
        });
      } else if (newTab !== 0 && this.chartInstance) {
        this.destroyChartInstance();
      }
    },
    /*config: {
      handler() {
        this.applySettings();
      },
      deep: true,
    },*/
  },

  computed: {
    currentBot() {
      return this.botsStore.bots[this.botsStore.activeBotIndex];
    },
    areAllSelected() {
      return (
          this.selectedOrders.length === this.ordersStore.limitOrders.length &&
          this.ordersStore.limitOrders.length > 0
      );
    },
    settings() {
        return this.botId !== null && this.botId !== undefined ?
              this.botsStore.bots[this.botId].settings :
            {
              maxOpenTrades: 20,
              initialPrice: 10000,
              currentPrice: 10000,
              gridStep: 20,
              levelsCount: 5,
              volume: 10,
              takeProfitDistance: 20,
              enableRestore: true,
              restoreCount: 300,
              enableGridShift: true,
              enableTpShift: false,
              totalProfit: 0,
              buyLevels: [],
              sellOrders: [],
              openTrades: [],
              closedTrades: [],

              timeIndex: 0,
              buyPoints: [],
              sellPoints: [],

              remainingRestoreCount: 300,
              linesData: [],

              gridShiftIntervals: [2000, 3000, 7000],


              priceStep: 1,
              priceStepMultiplier: 10,
              volatility: 1,
              interval: 10,




              priceStart: 10000,

              priceData: [],
            };
    },
    currentPriceStr () {
      return  this.settings ?
      this.settings.currentPrice.toFixed(2) :
      null
    },
    remainingBuyLimits() {
      return this.settings ?
          Math.max(this.settings.maxOpenTrades - this.settings.openTrades.length, 0) :
          null;
    },
  }
};
</script>

