<template>
  <div class="mesh-bot">

    <div class="meshbot-section">

      <div class="meshbot-section-header"
           @click="toggleBlock('block0')">
        <h2 class="title">
          <i  v-if="visibilityState['block0']" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Управление шаблонами и ботами
        </h2>
      </div>

      <div class="meshbot-content"
           v-if="visibilityState['block0']">

        <div class="create-bot">

          <div class="bots" style="display: grid; grid-template-columns: 1fr 1fr;">

            <div class="bots-section">

              <div class="bot-section-title">
                Шаблоны для симуляции и экспериментов
              </div>

              <div class="bots-selector-container">

                <div style="margin: 0 0 20px; font-weight: bold;">Создание шаблона</div>

                <div class="bots-selector">

                  <div class="dropdown-selector">
                    <span class="name">Параметры:</span>
                    <select v-model="dropdownSelectedTemplate">
                      <option v-for="(item, index) in computedTabs" :key="item.name" :value="index">
                        {{ item.name }}
                      </option>
                    </select>
                  </div>

<!--                  <div class="context-selector">
                    <span class="name">Контекст:</span>
                    <select v-model="templateMarket">
                      <option v-for="market in markets" :key="market" :value="market">
                        {{ market }}
                      </option>
                    </select>
                    <select v-model="templateBoard">
                      <option v-for="board in boards" :key="board" :value="board">
                        {{ board }}
                      </option>
                    </select>
                    <select v-model="templateTicker">
                      <option v-for="ticker in tickers" :key="ticker" :value="ticker">
                        {{ ticker }}
                      </option>
                    </select>
                  </div>-->

                </div>

                <div class="bots-selector-button">
                  <button class="btn btn-bot-add"
                          style="margin-right: 6px;"
                          @click="addTemplate">
                    Создать шаблон
                  </button>
                </div>
              </div>

              <div class="bots-section-title">
                Шаблоны <span>(Симуляторы, не торгуют)</span>
              </div>

              <div class="tabs">
                <div
                    v-for="(template, index) in templates"
                    :key="index"
                    class="bot-item"
                    :class="{ active: activeTemplate === index && isTemplateActive }"
                    @click="switchToTemplate(index)"
                >
                  {{ template.name }}

                  <!-- Кнопка удаления -->
                  <div
                      class="delete-bot"
                      :class="{ disabled: index === 0 }"
                      @click.stop="index !== 0 ? deleteTemplate(index) : null"
                      :title="index === 0 ? 'Базовый шаблон не удаляем' : `Удалить ${template.name}`"
                  >
                    <i class="fal fa-trash"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="bots-section">

              <div class="bot-section-title">
                Боты для торговли
              </div>

              <div class="bots-selector-container">

                <div style="margin: 0 0 20px; font-weight: bold;">Создание бота</div>

                <div class="bots-selector">

                  <div class="dropdown-selector">
                    <span class="name">Параметры:</span>
                    <select v-model="dropdownSelectedBot">
                      <option v-for="(item, index) in computedTabs" :key="item.name" :value="index">
                        {{ item.name }}
                      </option>
                    </select>
                  </div>

                  <div class="context-selector">
                    <span class="name">Контекст бота:</span>
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

                </div>

                <div class="bots-selector-button">
                  <button class="btn btn-bot-add"
                          style="margin-right: 6px;"
                          @click="createBot">
                    Создать бота {{ selectedTicker }}
                  </button>
                </div>

              </div>

              <div class="bots-section-title">
                Реальные боты <span>(Можно включить торговлю)</span>
              </div>

              <div v-if="tabStore.tabs.length === 0" class="empty-message-bots">
                Список ботов пока пуст.
              </div>

              <div class="tabs">
                <div
                    v-for="(tab, index) in tabStore.tabs"
                    :key="index"
                    class="bot-item"
                    :class="{ active: activeBot === index }"
                    @click="switchToTab(index)"
                >
                  <i v-if="tab.name === 'Симулятор'" class="fal fa-gamepad-modern"></i>
                  {{ tab.name }}


                  <div class="delete-bot"
                       @click="deleteBot(index)"
                       :title="`Удалить ${ tab.name }`">
                    <i class="fal fa-trash"></i>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>

    <div v-show="isTemplateActive">
      <SimulationComponent />
    </div>

    <!-- Динамические вкладки начинаются с индекса 1 -->
    <div v-for="(tab, index) in computedTabs" :key="tab.name">
      <div v-show="activeBot === index">
        <TradeComponent />
      </div>
    </div>

  </div>
</template>

<script>
import {useSimulationStore} from "@/stores/simulationStore";
import { useTabStore } from '@/stores/tabStore.js';
import TradeComponent from "@/widgets/MeshBot/components/TradeComponent.vue";
import SimulationComponent from "@/widgets/MeshBot/components/SimulationComponent.vue";

export default {
  name: "MeshBotTemplate",

  setup() {
    const simulationStore = useSimulationStore();
    const tabStore = useTabStore();

    return { tabStore, simulationStore };
  },

  components: {
    TradeComponent,
    SimulationComponent,
  },

  data() {
    return {

      // Для списка параметров шаблонов
      dropdownSelectedTemplate: 0,
      // Для списка параметров ботов
      dropdownSelectedBot: 0,

      dropdownSelectedIndex: 0,

      selectedFromDropdown: 0,
      selectedTemplate: "Шаблон 1",
      selectedBotTicker: 0,

      selectedMarket: 'MOEX',
      selectedBoard: 'TQBR',
      selectedTicker: 'LKOH',

      templateMarket: 'MOEX', // Для шаблонов
      templateBoard: 'TQBR',  // Для шаблонов
      templateTicker: 'Шаблон 1', // Для шаблонов

      markets: ['MOEX', 'SPBEX'],
      boards: ['TQBR', 'TQTF'],
      tickers: ['Шаблон 1', 'SBER', 'LKOH', 'GAZP', 'MTLR'],

      activeTemplate: 0,
      activeBot: null, // Индекс активной вкладки для ботов
      isTemplateActive: true, // Флаг для "Шаблона 1"

      visibilityState: {
        block0: true,
      }
    }
  },

  methods: {

    handleDropdownSelection(index) {
      this.dropdownSelectedIndex = index; // Только обновляем выбранный элемент
    },

    getNextBotIndex(ticker) {
      const botsWithTicker = this.tabStore.tabs.filter(bot => bot.ticker === ticker);
      const indices = botsWithTicker.map(bot => {
        const match = bot.name.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });

      return indices.length ? Math.max(...indices) + 1 : 1;
    },

    addTemplate() {
      const selectedConfig = this.computedTabs[this.dropdownSelectedTemplate];
      const newTemplate = {
        name: `Шаблон ${this.templates.length + 1}`,
        isPrimary: false,
        market: selectedConfig?.market || this.templateMarket,
        board: selectedConfig?.board || this.templateBoard,
        ticker: selectedConfig?.ticker || this.templateTicker,
      };
      this.simulationStore.templates.push(newTemplate);

      const newIndex = this.templates.length - 1; // Индекс нового шаблона
      this.switchToTemplate(newIndex);
    },

    deleteTemplate(index) {
      if (this.templates[index]?.isPrimary && this.templates.length === 1) {
        alert("Нельзя удалить единственный основной шаблон.");
        return;
      }

      this.simulationStore.templates.splice(index, 1);

      // Если остались шаблоны, выделяем новый активный
      if (this.templates.length > 0) {
        // Выбираем предыдущий или последний, если удаляется последний
        const newActiveIndex = Math.min(index, this.templates.length - 1);
        this.activeTemplate = newActiveIndex;
        this.switchToTemplate(newActiveIndex, false); // Второй аргумент отключает вызов дополнительных методов
      } else {
        // Если шаблонов нет, переключаемся на "пустое состояние"
        this.activeTemplate = null;
        this.isTemplateActive = false;
      }
    },

    switchToTemplate(index) {
      const template = this.templates[index];
      if (!template) return;

      this.simulationStore.selectedTemplate = index;
      this.simulationStore.templateMarket = template.market;
      this.simulationStore.templateBoard = template.board;
      this.simulationStore.templateTicker = template.ticker;

      // Устанавливаем шаблон
      this.activeTemplate = index;
      // Устанавливаем флаг, чтобы отобразить SimulationComponent
      this.isTemplateActive = true;
      // Деактивируем любые активные боты
      this.activeBot = null;
    },

    switchToTab(index) {
      const bot = this.tabStore.tabs[index];
      if (!bot) return;

      this.activeBot = index;
      this.isTemplateActive = false;
    },

    deleteBot(index) {
      if (index < 0 || index >= this.tabStore.tabs.length) return;

      this.tabStore.tabs.splice(index, 1);

      if (this.tabStore.tabs.length > 0) {
        // Выделить предыдущего бота или последнего оставшегося
        this.activeBot = Math.min(index, this.tabStore.tabs.length - 1);
        this.switchToTab(this.activeBot);
      } else {
        // Если ботов нет, вернуться к базовому шаблону
        this.activeTemplate = 0;
        this.isTemplateActive = true;
        this.activeBot = null;
      }

      /*
      this.selectedFromDropdown = 0;
      this.activeTemplate = 0;
      this.isTemplateActive = true;
      this.activeBot = null;*/
    },

    createBot() {
      const selectedConfig = this.computedTabs[this.dropdownSelectedBot];

      const nextIndex = this.getNextBotIndex(this.selectedTicker);

      const botName = `${this.selectedTicker} ${nextIndex}`;
      const newBot = {
        market: selectedConfig?.market || this.selectedMarket,
        board: selectedConfig?.board || this.selectedBoard,
        ticker: selectedConfig?.ticker || this.selectedTicker,
        name: botName,
        settings: {
          gridStep: 10,
          levelsCount: 5,
          volume: 100,
        },
      };
      this.tabStore.tabs.push(newBot);

      // Переход на новую вкладку бота
      const newIndex = this.tabStore.tabs.length - 1; // Индекс нового бота
      this.switchToTab(newIndex);
    },

    toggleBlock(blockId) {
      this.visibilityState[blockId] = !this.visibilityState[blockId];
    },
  },

  computed: {
    templates() {
      return this.simulationStore.templates;
    },

    computedTabs() {
      return [...this.templates, ...this.tabStore.tabs];
    },
  },
};
</script>

<style scoped>
.bots-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.context-selector,
.dropdown-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

