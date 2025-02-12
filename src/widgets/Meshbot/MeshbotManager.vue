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
                <button class="btn btn-bot-add"
                        @click="createBot">
                  Создать бота «{{ selectedTicker }}»
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

<!--    <div style="padding: 10px 0;"></div>-->

    <div v-if="meshbotStore.bots.length === 0" class="empty-message-bots">
      Список ботов пока пуст.
    </div>

    <div v-else class="tabs">
      <div
          v-for="bot in meshbotStore.bots"
          :key="bot.name"
          class="bot-item"
          :class="{ active: meshbotStore.activeBotName === bot.name }"
          @click="switchTab(bot.name)"
      >
        {{ bot.name }}
      </div>

    </div>

    <div v-for="bot in meshbotStore.bots" :key="bot.name" style="position: relative;">
        <MeshbotInstance
            :bot="bot"
            :isActive="meshbotStore.activeBotName === bot.name"/>

      <div v-if="meshbotStore.activeBotName === bot.name"
           class="delete-bot">
        <div class="delete-bot-button"
             @click.stop="meshbotStore.deleteBot(bot.name)">
          Удалить «{{bot.name}}»
        </div>
      </div>
    </div>

  </div>
</template>

<script>
//import { v4 as uuidv4 } from 'uuid';

import OrderManager from "@/components/OrderManager.vue";

import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';

import {useMeshbotStore} from "@/widgets/Meshbot/stores/meshbotStore";
import MeshbotInstance from "@/widgets/Meshbot/MeshbotInstance.vue";

import AlorOrderbooks from "@/components/AlorOrderbooks.vue";
import AlorCandles from "@/components/AlorCandles.vue";
import DataFabric from "@/components/DataFabric.vue";
import AlorQuotes from "@/components/AlorQuotes.vue";
import AlorTrades from "@/components/AlorTrades.vue";

export default {
  name: "MeshbotManager",

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

      //dropdownSelectedBot: 0,
      
      markets: ['MOEX', 'SPBEX'],
      boards: ['TQBR', 'TQTF'],
      tickers: ['Шаблон 1', 'SBER', 'LKOH', 'GAZP', 'MTLR', 'VTBR', 'FESH', 'AFLT'],
      selectedMarket: 'MOEX',
      selectedBoard: 'TQBR',
      selectedTicker: 'LKOH',
      
    }
  },

  methods: {

    createBot() {
      this.meshbotStore.createBot({
        market: this.selectedMarket,
        board: this.selectedBoard,
        ticker: this.selectedTicker
      });
      this.switchTab(this.meshbotStore.activeBotName);
    },

    switchTab(botName) {
      this.meshbotStore.setActiveBotName(botName);
    },

    toggleBlock(blockId) {
      this.meshbotStore.visibilityState[blockId] = !this.meshbotStore.visibilityState[blockId];
    },
  },

  computed: {

  },

  mounted () {

    console.log('Selected bot', this.meshbotStore.activeBotName);

  },

};
</script>
