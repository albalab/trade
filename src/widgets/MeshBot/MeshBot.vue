<template>
  <div class="mesh-bot">

    <div class="meshbot-section" style="overflow: hidden;">

      <div class="meshbot-section-header"
           @click="toggleBlock('block0')">
        <h2 class="title">
          <i  v-if="visibilityState['block0']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Создание ботов
        </h2>
      </div>

      <div class="meshbot-content"
           v-if="visibilityState['block0']">

        <div class="bots-selector-container">

          <div class="bots-selector">
            <div class="bots-selector-wrapper">

              <div class="context-selector">
                <span class="name">Задать контекст бота:</span>
                <select v-model="selectedMarket">
                  <option v-for="market in markets" :key="market" :value="market">
                    {{ market }}
                  </option>
                </select>
                <select v-model="selectedBoard">
                  <option v-for="board in boards" :key="board" :value="board">
                    {{ board }}
                  </option>
                </select>
                <select v-model="selectedTicker">
                  <option v-for="ticker in tickers" :key="ticker" :value="ticker">
                    {{ ticker }}
                  </option>
                </select>
              </div>

              <div class="dropdown-selector">
                <span class="name">Скопировать параметры бота:</span>
                <select v-model="dropdownSelectedBot">
                  <option v-if="simulationStore.bots.length === 0" value="0" disabled>
                    По умолчанию
                  </option>
                  <option v-for="(item, index) in simulationStore.bots" :key="item.name" :value="index">
                    {{ item.name }}
                  </option>
                </select>
              </div>

            </div>
            <div class="bots-selector-button">
              <button class="btn btn-bot-add"
                      style="margin-right: 6px;"
                      @click="createBot">
                Создать бота «{{ selectedTicker }}»
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>

    <div style="padding: 10px 0;"></div>

    <div v-if="simulationStore.bots.length === 0" class="empty-message-bots">
      Список ботов пока пуст.
    </div>

    <div v-else class="tabs">
      <div
          v-for="(bot, index) in simulationStore.bots"
          :key="index"
          class="bot-item"
          :class="{ active: simulationStore.activeBotIndex === index }"
          @click="switchTab(index)"
      >
        {{ bot.name }}
      </div>
    </div>

    <div v-for="(bot, index) in simulationStore.bots" :key="bot.name">
      <div v-show="simulationStore.activeBotIndex === index">
        <SimulationComponent
            :stopBotSimulationIndex="stopBotSimulationIndex"
            :botId="index"
            @delete-bot="deleteBot(index)" />
      </div>
    </div>

  </div>
</template>

<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';
import {getOrders, getPositions} from "@/modules/LimitOrderModule";

import {useSimulationStore} from "@/stores/simulationStore";
import SimulationComponent from "@/widgets/MeshBot/components/SimulationComponent.vue";


export default {
  name: "MeshBotTemplate",

  setup() {
      const ordersStore = useOrdersStore();
      const orderbooksStore = useOrderbooksStore();

    const simulationStore = useSimulationStore();

    return { simulationStore, orderbooksStore, ordersStore, };
  },

  components: {
    SimulationComponent,
  },

  data() {
    return {

      stopBotSimulationIndex: null,

      dropdownSelectedBot: 0,
      
      markets: ['MOEX', 'SPBEX'],
      boards: ['TQBR', 'TQTF'],
      tickers: ['Шаблон 1', 'SBER', 'LKOH', 'GAZP', 'MTLR'],
      selectedMarket: 'MOEX',
      selectedBoard: 'TQBR',
      selectedTicker: 'LKOH',

      visibilityState: {
        block0: true,
      }
    }
  },

  methods: {
//ACTIVE ORDERS
    processOrders(orders) {
      orders.forEach((order) => {
        const { id, status } = order;

        if (status === "working") {
          const existingOrder = this.ordersStore.limitOrders.find(
              (existing) => existing.data.id === id
          );

          if (!existingOrder) {
            // Добавляем поле orderNumber, если его нет
            const enrichedOrder = {
              ...order,
              orderNumber: order.id, // Используем id как orderNumber
            };

            this.ordersStore.limitOrders.push({ data: enrichedOrder });
          }
        } else if (status === "canceled" || status === "filled") {
          this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
              (existing) => existing.data.id !== id
          );
        }
      });
    },


    async fetchPositions2() {
      try {
        const positions = await getPositions('MOEX', 'D88141', 'Simple', false);

        console.log(positions);

        // Преобразуем полученные позиции и обновляем activePositions
        const activePositions = {};

        positions.forEach((position) => {
          // Исключаем валюту (например, RUB) и пустые позиции
          if (position.symbol !== 'RUB' && position.currentVolume !== 0) {
            activePositions[position.symbol] = position;
          }
        });

        // Обновляем activePositions
        this.ordersStore.activePositions = activePositions;
        //this.processPositions(positions);
      } catch (error) {
        console.error('Ошибка при загрузке позиций:', error.message);
      }
    },

    connectToWebSocket2() {
      const socket = new WebSocket("wss://signalfabric.com/positions/");

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          //console.log(data);

          // Проверяем, что пришли данные о позициях
          if (data && data.data) {

            if( data.data.symbol === "RUB") return;

            const activePositions = { ...this.ordersStore.activePositions };

            if( data.data.currentVolume == 0 ){
              delete activePositions[data.data.symbol];
            } else {
              activePositions[data.data.symbol] = data.data;
            }

            this.ordersStore.activePositions = activePositions;
            /*//console.log(data.data)
            const positions = { ...this.ordersStore.activePositions };


              if( data.data.currentVolume !== 0 ){
                positions[data.data.symbol] = data.data;
              } else {
                //delete positions[data.data.symbol];
              }

            this.ordersStore.activePositions = positions;*/

          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket for positions");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    },

    async fetchOrders() {
      try {
        const orders = await getOrders('MOEX', 'D88141', 'Simple');

        console.log(orders.filter(order => order.status === 'working'));
        //console.log('Полученные заявки:', orders.filter(order => order.type === 'filled'));

        this.processOrders(orders);

      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error.message);
      }
    },

    connectToWebSocket() {
      const socket = new WebSocket("wss://signalfabric.com/orders/");

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data && data.data) {
            const { id, status } = data.data;

            setTimeout(() => {
              if (status === "working") {
                const existingOrder = this.ordersStore.limitOrders.find(
                    (order) => order.data.id === id
                );

                if (!existingOrder) {
                  // Добавляем поле orderNumber, если его нет
                  const enrichedData = {
                    ...data.data,
                    orderNumber: data.data.id, // Используем id как orderNumber
                  };

                  this.ordersStore.limitOrders.push({ data: enrichedData });
                }
              } else if (status === "canceled" || status === "filled") {
                this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
                    (order) => order.data.id !== id
                );
              }
            }, 0);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket for orders");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    },


    getNextBotIndex(ticker) {
      const botsWithTicker = this.simulationStore.bots.filter(bot => bot.ticker === ticker);
      const indices = botsWithTicker.map(bot => {
        const match = bot.name.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });

      return indices.length ? Math.max(...indices) + 1 : 1;
    },

    switchTab(index) {
      this.stopBotSimulationIndex = index;
      this.simulationStore.setActiveBotIndex(index);
    },

    deleteBot(index) {
      if (index < 0 || index >= this.simulationStore.bots.length) return;

      this.stopBotSimulationIndex = null;

      setTimeout(() => {

        this.stopBotSimulationIndex = index;


        this.simulationStore.bots.splice(index, 1);

        if (this.simulationStore.activeBotIndex === index) {
          if (this.simulationStore.bots.length > 0) {
            // Выбираем предыдущего или последнего, если удаляется последний
            const newActiveIndex = Math.min(index, this.simulationStore.bots.length - 1);
            this.simulationStore.activeBotIndex = newActiveIndex;
            this.switchTab(newActiveIndex);
          } else {
            this.simulationStore.activeBotIndex = null;
          }
        } else if (this.simulationStore.activeBotIndex > index) {
          // Корректируем индекс активного бота, если он был смещён
          this.simulationStore.activeBotIndex -= 1;
        }

        // Если остались боты, выделяем новый активный
        if (this.simulationStore.bots.length > 0) {
          const newActiveIndex = Math.min(index, this.simulationStore.bots.length - 1);
          this.simulationStore.activeBotIndex = newActiveIndex;
          this.switchTab(newActiveIndex); // Переходим на новый активный бот
        } else {
          this.simulationStore.activeBotIndex = null;
        }

        // Если текущий выбранный бот в селекторе параметров удалён
        if (this.dropdownSelectedBot === index || this.simulationStore.bots.length === 0) {
          this.dropdownSelectedBot = 0; // Переключаем на базовый шаблон
        } else if (this.dropdownSelectedBot > index) {
          this.dropdownSelectedBot -= 1; // Корректируем индекс
        }

        // Если ботов больше нет, гарантируем, что селектор параметров указывает на базовый шаблон
        if (this.simulationStore.bots.length === 0) {
          this.dropdownSelectedBot = 0; // Установить базовый шаблон
        }
      }, 0);

    },

    createBot() {

      const defaultSettings = {
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

      // Получаем выбранные параметры из другого бота, если он выбран
      const selectedConfig = this.dropdownSelectedBot > 0
          ? this.simulationStore.bots[this.dropdownSelectedBot - 1] // -1, чтобы учитывать, что первый элемент в списке - "по умолчанию"
          : null;

      // Устанавливаем параметры, используя выбранные, если есть, иначе по умолчанию
      const newBotSettings = {
        ...defaultSettings,
        ...(selectedConfig ? selectedConfig.settings : {}),
      };

      const nextIndex = this.getNextBotIndex(this.selectedTicker);

      const botName = `${this.selectedTicker} ${nextIndex}`;
      const newBot = {
        market: selectedConfig?.market || this.selectedMarket,
        board: selectedConfig?.board || this.selectedBoard,
        ticker: selectedConfig?.ticker || this.selectedTicker,
        name: botName,
        settings: newBotSettings,
      };
      this.simulationStore.bots.push(newBot);
      
      this.simulationStore.activeBotIndex = this.simulationStore.bots.length - 1;  // Выделяем только что созданного бота
      this.switchTab(this.simulationStore.activeBotIndex); // Переход на новую вкладку бота
    },

    toggleBlock(blockId) {
      this.visibilityState[blockId] = !this.visibilityState[blockId];
    },
  },

  computed: {
    activeBotIndex() {
      return this.simulationStore.bots[this.simulationStore.activeBotIndex];
    }
  },

  mounted () {
    //ACTIVE ORDERS
    this.fetchOrders();
    this.connectToWebSocket();

    //ACTIVE POSITIONS
    this.fetchPositions2();
    this.connectToWebSocket2();


    if (this.simulationStore.bots.length > 0) {


      //this.simulationStore.activeBotIndex = 0;
    }
  },

};
</script>
