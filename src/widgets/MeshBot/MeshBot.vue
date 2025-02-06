<template>
  <div class="mesh-bot">


    <div v-if="$route.name === 'meshbot'">

      <OrderManager />

      <DataFabric v-show="false"/>
      <AlorTrades v-show="false"/>
      <AlorCandles v-show="false"/>
      <AlorOrderbooks v-show="false"/>
      <AlorQuotes v-show="false"/>
    </div>

<!--    <div style="padding: 20px;">
      Meshbot context: {{$route.name}}
    </div>-->

    <div class="meshbot-section meshbot-section-main">

      <div class="meshbot-section-header"
           style="border-bottom: none;"
           @click="toggleBlock('block0')">
        <h2 class="title">
          <i  v-if="meshbotStore.visibilityState['block0']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Создание ботов
        </h2>
      </div>

      <div class="meshbot-content"
           v-if="meshbotStore.visibilityState['block0']">

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
                  <option v-if="meshbotStore.bots.length === 0" value="0" disabled>
                    По умолчанию
                  </option>
                  <option v-for="(item, index) in meshbotStore.bots" :key="item.name" :value="index">
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

    <div v-if="meshbotStore.bots.length === 0" class="empty-message-bots">
      Список ботов пока пуст.
    </div>

    <div v-else class="tabs">
      <div
          v-for="(bot, index) in meshbotStore.bots"
          :key="index"
          class="bot-item"
          :class="{ active: meshbotStore.activeBotIndex === index }"
          @click="switchTab(index)"
      >
        {{ bot.name }}
      </div>
    </div>

    <div v-for="(bot, index) in meshbotStore.bots" :key="bot.name">
      <div v-show="meshbotStore.activeBotIndex === index">
        <MeshbotInstance
            :bot="bot"
            :botName="bot.name"
            :isActiveBot="meshbotStore.activeBotIndex === index"
            :stopBotFromParentIndex="stopBotFromParentIndex"
            :botId="index"
            @delete-bot="deleteBot(index)" />
      </div>
    </div>

  </div>
</template>

<script>
//import { v4 as uuidv4 } from 'uuid';

import OrderManager from "@/components/OrderManager.vue";

import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';

import {useMeshbotStore} from "@/stores/meshbotStore";
import MeshbotInstance from "@/widgets/MeshBot/MeshbotInstance.vue";

import AlorOrderbooks from "@/components/AlorOrderbooks.vue";
import AlorCandles from "@/components/AlorCandles.vue";
import DataFabric from "@/components/DataFabric.vue";
import AlorQuotes from "@/components/AlorQuotes.vue";
import AlorTrades from "@/components/AlorTrades.vue";

const defaultSettingsBot = {
  maxOpenTrades: 10,
  initialPrice: 10000,
  currentPrice: 10000,
  gridStep: 20,
  levelsCount: 3,
  volume: 1,
  takeProfitDistance: 10,
  enableRestore: true,
  restoreCount: 300,
  enableGridShift: true,
  enableTpShift: false,
  totalProfit: 0,

  buyLevels: [], //Уровни цен согласно логике сеточника

  placedProfitOrders: [],

  profitLevels: [],
  openTrades: [],
  closedTrades: [],

  timeIndex: 0,
  buyPoints: [],
  sellPoints: [],

  remainingRestoreCount: 300,
  linesData: [],

  gridShiftIntervals: [19000, 31000 ], // 11000, 31000, 61000, 101000

  priceStep: 1,
  priceStepMultiplier: 10,
  volatility: 1,
  interval: 1000,

  priceStart: 10000,

  priceData: [],

};

export default {
  name: "MeshBotTemplate",

  setup() {
      const ordersStore = useOrdersStore();
      const orderbooksStore = useOrderbooksStore();

    const meshbotStore = useMeshbotStore();

    return { meshbotStore, orderbooksStore, ordersStore, };
  },

  components: {
    OrderManager,
    AlorTrades, AlorQuotes, DataFabric, AlorCandles, AlorOrderbooks,
    MeshbotInstance,
  },

  data() {
    return {

      stopBotFromParentIndex: null,

      dropdownSelectedBot: 0,
      
      markets: ['MOEX', 'SPBEX'],
      boards: ['TQBR', 'TQTF'],
      tickers: ['Шаблон 1', 'SBER', 'LKOH', 'GAZP', 'MTLR'],
      selectedMarket: 'MOEX',
      selectedBoard: 'TQBR',
      selectedTicker: 'LKOH',
      
    }
  },

  methods: {

    createBot() {
      
      // Получаем выбранные параметры из другого бота, если он выбран
      const selectedConfig = this.dropdownSelectedBot > 0
          ? this.meshbotStore.bots[this.dropdownSelectedBot - 1] // -1, чтобы учитывать, что первый элемент в списке - "по умолчанию"
          : null;

      // Устанавливаем параметры, используя выбранные, если есть, иначе по умолчанию
      const newBotSettings = {
        ...defaultSettingsBot,
        ...(selectedConfig ? selectedConfig.settings : {}),
      };

      const nextIndex = this.getNextBotIndex(this.selectedTicker);

      const botName = `${this.selectedTicker} ${nextIndex}`;

      const newBot = {
        //id: uuidv4(),

        placedBuyOrdersIds: [],

        market: selectedConfig?.market || this.selectedMarket,
        board: selectedConfig?.board || this.selectedBoard,
        ticker: selectedConfig?.ticker || this.selectedTicker,
        name: botName,
        settings: newBotSettings,
      };

      this.meshbotStore.bots.push(newBot);

      this.meshbotStore.activeBotIndex = this.meshbotStore.bots.length - 1;  // Выделяем только что созданного бота
      this.switchTab(this.meshbotStore.activeBotIndex); // Переход на новую вкладку бота
    },

    getNextBotIndex(ticker) {
      const botsWithTicker = this.meshbotStore.bots.filter(bot => bot.ticker === ticker);
      const indices = botsWithTicker.map(bot => {
        const match = bot.name.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });

      return indices.length ? Math.max(...indices) + 1 : 1;
    },

    switchTab(index) {
      //this.stopBotFromParentIndex = index;
      this.meshbotStore.setActiveBotIndex(index);
    },

    deleteBot(index) {
      if (index < 0 || index >= this.meshbotStore.bots.length) return;

      this.stopBotFromParentIndex = null;

      setTimeout(() => {

        this.stopBotFromParentIndex = index;


        this.meshbotStore.bots.splice(index, 1);

        if (this.meshbotStore.activeBotIndex === index) {
          if (this.meshbotStore.bots.length > 0) {
            // Выбираем предыдущего или последнего, если удаляется последний
            const newActiveIndex = Math.min(index, this.meshbotStore.bots.length - 1);
            this.meshbotStore.activeBotIndex = newActiveIndex;
            this.switchTab(newActiveIndex);
          } else {
            this.meshbotStore.activeBotIndex = null;
          }
        } else if (this.meshbotStore.activeBotIndex > index) {
          // Корректируем индекс активного бота, если он был смещён
          this.meshbotStore.activeBotIndex -= 1;
        }

        // Если остались боты, выделяем новый активный
        if (this.meshbotStore.bots.length > 0) {
          const newActiveIndex = Math.min(index, this.meshbotStore.bots.length - 1);
          this.meshbotStore.activeBotIndex = newActiveIndex;
          this.switchTab(newActiveIndex); // Переходим на новый активный бот
        } else {
          this.meshbotStore.activeBotIndex = null;
        }

        // Если текущий выбранный бот в селекторе параметров удалён
        if (this.dropdownSelectedBot === index || this.meshbotStore.bots.length === 0) {
          this.dropdownSelectedBot = 0; // Переключаем на базовый шаблон
        } else if (this.dropdownSelectedBot > index) {
          this.dropdownSelectedBot -= 1; // Корректируем индекс
        }

        // Если ботов больше нет, гарантируем, что селектор параметров указывает на базовый шаблон
        if (this.meshbotStore.bots.length === 0) {
          this.dropdownSelectedBot = 0; // Установить базовый шаблон
        }
      }, 0);

    },
    
    toggleBlock(blockId) {
      this.meshbotStore.visibilityState[blockId] = !this.meshbotStore.visibilityState[blockId];
    },
  },

  computed: {

  },

  mounted () {

    console.log('Selected bot', this.meshbotStore.activeBotIndex);

  },

};
</script>
