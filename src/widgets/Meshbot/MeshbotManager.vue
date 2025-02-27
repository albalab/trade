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
                <div>
                  <select v-model="selectedMarket">
                    <option v-for="market in markets" :key="market" :value="market">
                      {{ market }}
                    </option>
                  </select>
                </div>
                <div>
                  <select v-model="selectedBoard">
                    <option v-for="board in boards" :key="board" :value="board">
                      {{ board }}
                    </option>
                  </select>
                </div>
                <div>
                  <select v-model="selectedTicker">
                    <option v-for="ticker in tickers" :key="ticker" :value="ticker">
                      {{ ticker }}
                    </option>
                  </select>
                </div>

              </div>

              <div class="bot-settings" style="margin: 0 0 20px;">
                <div>
                  <label>
                    <span style="display: inline-block; width: 200px;">Max Open Trades:</span>
                    <input type="number" v-model.number="botSettings.maxOpenTrades" min="1">
                  </label>
                </div>
                <div>
                  <label>
                    <span style="display: inline-block; width: 200px;">Grid Step:</span>
                    <input type="number" v-model.number="botSettings.gridStep">
                  </label>
                </div>
                <div>
                  <label>
                    <span style="display: inline-block; width: 200px;">Levels Count:</span>
                    <input type="number" v-model.number="botSettings.levelsCount">
                  </label>
                </div>
                <div>
                  <label>
                    <span style="display: inline-block; width: 200px;">Volume:</span>
                    <input type="number" v-model.number="botSettings.volume">
                  </label>
                </div>
                <div>
                  <label>
                    <span style="display: inline-block; width: 200px;">Take Profit Distance:</span>
                    <input type="number" v-model.number="botSettings.takeProfitDistance">
                  </label>
                </div>
                <div>
                  <label>
                    <span style="display: inline-block; width: 200px;">Grid Shift Intervals (через запятую):</span>
                    <input type="text" v-model="botSettings.gridShiftIntervals">
                  </label>
                </div>
              </div>

              <div style="margin: 0 0 10px;">
                <button class="btn"
                        @click="createBot">
                  Создать бота «{{ selectedTicker }}»
                </button>

                <button class="btn" @click="createBots">
                  Создать несколько ботов
                </button>

              </div>

              <div class="bot-list-config">
                <h3>Конфигурация группы ботов</h3>

                <div style="width: 50%;">
                  <textarea style="width: 100%;" v-model="botsListConfig" rows="10" placeholder="Введите конфигурацию в формате JSON"></textarea>
                </div>

                <button class="btn" @click="createBotsFromList">
                  Создать ботов по списку
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

    <div v-else>

      <div style="padding: 20px 0 10px;">
        <button class="btn" @click="activateAllBots">
          Запустить всех ботов
        </button>

        <button class="btn" @click="deactivateAllBots">
          Остановить всех ботов
        </button>

        <button class="btn btn-bot-delete-all" @click="deleteAllBots">
          Удалить всех ботов
        </button>
      </div>

      <div class="tabs">
        <div
            v-for="bot in meshbotStore.bots"
            :key="bot.name"
            class="bot-item"
            :class="{ active: meshbotStore.activeBotName === bot.name }"
            @click="switchTab(bot.name)"
        >
          {{ bot.name }}
          <span class="bot-activity" :class="{ activated: bot.settings.isTradingActive }"></span>
        </div>
      </div>
    </div>

    <div v-for="bot in meshbotStore.bots" :key="bot.name" style="position: relative;">
        <MeshbotInstance
            ref="botInstance"
            :bot="bot"
            :isActive="meshbotStore.activeBotName === bot.name"/>

      <div v-if="meshbotStore.activeBotName === bot.name"
           class="delete-bot">
        <div class="delete-bot-button"
             @click.stop="meshbotStore.deleteBot(bot.name)">
          Удалить бота «{{bot.name}}»
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
      tickers: ['SBER', 'LKOH', 'GAZP', 'MTLR', 'VTBR', 'FESH', 'AFLT'],
      selectedMarket: 'MOEX',
      selectedBoard: 'TQBR',
      selectedTicker: 'LKOH',

      // Локальные настройки, которые будут переданы при создании бота
      botSettings: {
        maxOpenTrades: 10,
        gridStep: 20,
        levelsCount: 3,
        volume: 1,
        takeProfitDistance: 10,
        // Для удобства ввода можно хранить как строку, а потом преобразовывать в массив чисел
        gridShiftIntervals: '11,17,47'
      },

      botsListConfig:
`{
"LKOH": {
  "maxOpenTrades": 10,
  "levelsCount": 3,
  "gridStep": 20,
  "volume": 1,
  "takeProfitDistance": 10,
  "gridShiftIntervals": [11,17,47]
},

"SBER": {
  "maxOpenTrades": 20,
  "levelsCount": 5,
  "gridStep": 20,
  "volume": 1,
  "takeProfitDistance": 10,
  "gridShiftIntervals": [11,17,47]
}
}`
    }
  },

  methods: {

    activateAllBots() {
      // Проверяем, что refs существуют и это массив (если создан один бот, ref может быть не массивом)
      const instances = this.$refs.botInstance;
      if (instances) {
        // Если один бот, приведем к массиву
        const botInstances = Array.isArray(instances) ? instances : [instances];
        botInstances.forEach(botInstance => {
          // Вызываем метод запуска торговли у каждого экземпляра
          botInstance.activateTrading();
        });
      }
    },

    deactivateAllBots() {
      let instances = this.$refs.botInstance;
      if (!Array.isArray(instances)) {
        instances = [instances];
      }
      instances.forEach(botInstance => {
        botInstance.deactivateTrading();
      });
    },

    randomizeSettings(baseSettings) {
      // Глубокая копия настроек
      const randomized = JSON.parse(JSON.stringify(baseSettings));

      // Пример случайных изменений:
      // Для maxOpenTrades – отклонение ±1 (но не меньше 1)
      randomized.maxOpenTrades = Math.max(1, baseSettings.maxOpenTrades + Math.floor(Math.random() * 3) - 1);

      // Для gridStep – отклонение ±10%
      randomized.gridStep = Math.round(baseSettings.gridStep * (1 + (Math.random() * 0.2 - 0.1)));

      // Для levelsCount – отклонение ±1, минимум 1
      randomized.levelsCount = Math.max(1, baseSettings.levelsCount + Math.floor(Math.random() * 3) - 1);

      // Для volume – отклонение ±10%
      randomized.volume = +(baseSettings.volume * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2);

      // Для takeProfitDistance – отклонение ±5%
      randomized.takeProfitDistance = Math.round(baseSettings.takeProfitDistance * (1 + (Math.random() * 0.1 - 0.05)));

      // Для gridShiftIntervals – для каждого элемента отклонение ±10%
      randomized.gridShiftIntervals = baseSettings.gridShiftIntervals.map(interval =>
          Math.round(interval * (1 + (Math.random() * 0.2 - 0.1)))
      );

      return randomized;
    },

    deleteAllBots() {
      // Сохраняем список имён ботов, чтобы избежать проблем с изменением массива во время итерации
      const botNames = this.meshbotStore.bots.map(bot => bot.name);
      botNames.forEach(name => {
        this.meshbotStore.deleteBot(name);
      });
    },

    createBotsFromList() {
      try {
        // Пытаемся распарсить введённый JSON
        const config = JSON.parse(this.botsListConfig);
        // Проходим по каждому ключу (тикеру) и его настройкам
        for (const ticker in config) {
          if (config.hasOwnProperty(ticker)) {
            const customSettings = config[ticker];
            // Здесь можно, при необходимости, добавить проверку или объединение с дефолтными настройками
            this.meshbotStore.createBot({
              market: this.selectedMarket,
              board: this.selectedBoard,
              ticker,
              customSettings
            });
          }
        }
        this.switchTab(this.meshbotStore.activeBotName);
      } catch (e) {
        alert('Ошибка парсинга конфигурации. Проверьте, что формат корректен (JSON).');
      }
    },

    createBots() {
      // Создаем копию массива тикеров
      const availableTickers = [...this.tickers];
      // Определяем количество ботов для создания: либо 5, либо столько, сколько доступно тикеров
      const count = Math.min(5, availableTickers.length);

      for (let i = 0; i < count; i++) {
        // Выбираем случайный индекс из оставшихся тикеров
        const randomIndex = Math.floor(Math.random() * availableTickers.length);
        // Извлекаем выбранный тикер и удаляем его из массива, чтобы он не повторялся
        const randomTicker = availableTickers.splice(randomIndex, 1)[0];

        // Создаем customSettings из локальных настроек
        const baseSettings = {
          ...this.botSettings,
          gridShiftIntervals: this.botSettings.gridShiftIntervals.split(',')
              .map(i => parseInt(i.trim()))
        };

        const customSettings = this.randomizeSettings(baseSettings);

        this.meshbotStore.createBot({
          market: this.selectedMarket,
          board: this.selectedBoard,
          ticker: randomTicker,
          customSettings
        });
      }
      this.switchTab(this.meshbotStore.activeBotName);
    },


    createBot() {

      // Преобразуем gridShiftIntervals из строки в массив чисел
      const baseSettings = {
        ...this.botSettings,
        gridShiftIntervals: this.botSettings.gridShiftIntervals.split(',')
            .map(i => parseInt(i.trim()))
      };

      const customSettings = this.randomizeSettings(baseSettings);

      this.meshbotStore.createBot({
        market: this.selectedMarket,
        board: this.selectedBoard,
        ticker: this.selectedTicker,
        customSettings
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
