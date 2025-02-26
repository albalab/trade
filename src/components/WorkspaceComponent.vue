<template>
  <div class="panels-container">

    <div class="toggle-socket">
      <div class="toggle-switch">
        <input
            type="checkbox"
            id="toggle"
            v-model="isRunning"
        />
        <label for="toggle" class="slider"></label>
      </div>
    </div>

    <div v-if="isRunning">
      <OrderManager />
      <DataFabric v-show="false"/>
      <AlorTrades v-show="false"/>
      <AlorCandles v-show="false"/>
      <AlorOrderbooks v-show="false"/>
      <AlorQuotes v-show="false"/>
    </div>

    <WidgetGrid :widgetsProps="widgets">
      <template #default="{ widget }">

        <div v-if="widget.type === 1" :data="widget">
          <DataFabric />
        </div>

        <div v-if="widget.type === 3" :data="widget">
          <CreateOrder />
        </div>

        <div v-if="widget.type === 4" :data="widget">
          <TopDeals />
        </div>

        <div v-if="widget.type === 5" :data="widget">
          <CreateGroupOrders />
        </div>

        <div v-if="widget.type === 6" :data="widget">
          <ActiveOrders />
        </div>

        <div v-if="widget.type === 7" :data="widget">
            <ActivePositions />
        </div>

        <div v-if="widget.type === 8" :data="widget">

          <div class="table table-trade">
            <div class="table-row table-head">
              <div class="table-cell"
                   @click="changeSort('ticker')">ticker</div>
              <div class="table-cell">Levels Frequency</div>
              <div class="table-cell"
                   v-for="field in summaryFields"
                   :key="field">
                <span @click="changeSort(field)">{{field}}</span>
                <span class="th-arrow" v-if="currentSortField === field">
            {{ currentSortDirection === 'asc' ? '↑' : '↓' }}
          </span>
              </div>
            </div>
            <div class="table-row"
                 :class="{'selected': selectedRows.includes(item[0])}"
                 @click="toggleSelection(item[0])"
                 v-for="item in sortedSummaryData"
                 :key="item[0]">

              <div class="table-cell">
                {{ item[0] }}
              </div>

              <div class="table-cell">
                <LevelsRenderer :levelsStats="tradesStore.levelsStats" :selectedTicker="item[0]"/>
              </div>

              <div class="table-cell" v-for="field in summaryFields" :key="field">
                <span>{{ item[1][field] || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="widget.type === 21" :data="widget">
          <MeshbotManager />
        </div>

        <div v-if="widget.type === 22" :data="widget">
          <ChatTemplate />
        </div>

        <div v-if="widget.type === 23" :data="widget">
          <TradingSectors />
        </div>

        <div v-if="widget.type === 9" :data="widget">
            <AlorStatsDiagram
                :totalItemsStats="buyFrequency"
                :streamItemsStats="sellFrequency"
                @select-ticker="selectTicker"
            />
        </div>

        <div v-if="widget.type === 10" :data="widget">
            <AlorStatsDiagram
                :totalItemsStats="limitedAccumulatedTradesStats"
                :streamItemsStats="limitedAccumulatedTradesStats2"
                @select-ticker="selectTicker"
            />
        </div>
        <div v-if="widget.type === 11" :data="widget">
            <AlorStatsDiagram
                :totalItemsStats="limitedAccumulatedOrderbooksStats"
                :streamItemsStats="limitedAccumulatedOrderbooksStats2"
                @select-ticker="selectTicker"
            />
        </div>
        <div v-if="widget.type === 12" :data="widget">
            <AlorStatsDiagram
                :totalItemsStats="limitedAccumulatedCandlesStats"
                :streamItemsStats="limitedAccumulatedCandlesStats2"
                @select-ticker="selectTicker"
            />
        </div>
        <div v-if="widget.type === 13" :data="widget">
            <AlorStatsDiagram
                :totalItemsStats="limitedAccumulatedQuotesStats"
                :streamItemsStats="limitedAccumulatedQuotesStats2"
                @select-ticker="selectTicker"
            />
        </div>

        <div v-if="widget.type === 14" :data="widget">
          <button class="btn"
                  @click="cancelAllOrders()">
            Снять все
          </button>
        </div>

        <div v-if="widget.type === 15" :data="widget">
          <div style="padding: 10px; height: 100px; overflow: hidden;">
            <div v-for="(item, key) in summaryData[selectedTicker]" :key="key">
              {{key}}: {{item}}
            </div>
          </div>
        </div>

        <div v-if="widget.type === 16" :data="widget">
          <StatisticRenderer v-if="candlesStore.newCandles" :items="candlesStore.newCandles" />
          <StatisticRenderer v-if="tradesStore.newTrades" :items="tradesStore.newTrades" />
          <StatisticRenderer v-if="orderbooksStore.newOrderbooks" :items="orderbooksStore.newOrderbooks" />
        </div>

        <div v-if="widget.type === 17" :data="widget">
          <CardioTemplate :waveChunk="newChunk" />

<!--          <div style="padding-top: 10px;">
            <button class="btn btn-second" @click="simulateNewData">Следующий чанк</button>
          </div>-->

        </div>

        <div v-if="widget.type === 19" :data="widget">
          <CardioTemplateWide :waveChunk="newChunkWide" />

<!--          <div style="padding-top: 10px;">
            <button class="btn btn-second" @click="simulateNewData">Следующий чанк</button>
          </div>-->

        </div>


        <div v-if="widget.type === 20" :data="widget">
          <span v-if="cachedSBER">real: {{cachedSBER}}</span> &nbsp;
          <span v-if="cachedSBER">normalized: {{normalizeValue(cachedSBER).toFixed(2)}}</span> &nbsp;
          <span v-if="minValue">min: {{minValue}}</span> &nbsp;
          <span v-if="maxValue">max: {{maxValue}}</span> &nbsp;
          <IntervalsTemplate :externalMetric="normalizeValue(cachedSBER)" />
        </div>

        <div v-if="widget.type === 18" :data="widget">
          <AlorStatsDiagram
              :totalItemsStats="dataFabricStore.aggregatedEvents"
              :streamItemsStats="dataFabricStore.chunkEvents"
              @select-ticker="selectTicker"
          />
        </div>

        <div v-if="widget.type === 24" :data="widget">
          <ElectronAPI />
        </div>
      </template>
    </WidgetGrid>









<!--    <div>
      <div v-for="item in limitOrders" :key="item?.data?.orderNumber">
        {{item?.data?.orderNumber}}
        <button @click="cancelOrders([item?.data?.orderNumber])">X</button>
      </div>
    </div>-->

    <!--    <SessionManager />-->

<!--    <div style="margin: 0 0 10px;">
      <div v-for="(item, key) in {
        ...globalData.tradesCounters,
        ...globalData.orderbooksCounters,
        ...globalData.quotesCounters}" :key="key">
        {{key}}: {{item}}
      </div>
    </div>


    <input type="text" v-model="selectedTicker"/><br>
    <div style="padding: 10px;">
      <div v-for="(item, key) in summaryData[selectedTicker]" :key="item?.id">
        {{key}}: {{item}}
      </div>
    </div>-->

<!--    <input type="text" v-model="selectedTicker"/><br>
    <div style="padding: 10px;">
      <div v-for="(item, key) in summaryData[selectedTicker]" :key="item?.id">
        {{key}}: {{item}}
      </div>
    </div>-->

<!--    <input type="text" v-model="selectedTicker"/><br>-->



  </div>
</template>

<script>

import { useDataFabricStore } from '@/stores/dataFabricStore';
import { useCandlesStore } from '@/stores/candlesStore';
import { useTradesStore } from '@/stores/tradesStore';
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useQuotesStore } from '@/stores/quotesStore';
import { useOrdersStore } from '@/stores/ordersStore';

//import SessionManager from './SessionManager';

/*
import {
  cancelAllOrders, getOrders, getPositions,

} from '@/services/LimitOrderService.js';
*/

//import AlorTradesPlus from './AlorTradesPlus.vue';

import WidgetGrid from './WidgetGrid.vue';

import TradingSectors from '@//widgets/TradingSectors.vue';
import ChatTemplate from '@//widgets/ChatTemplate.vue';
import MeshbotManager from '@//widgets/Meshbot/MeshbotManager.vue';
import CardioTemplateWide from '@/widgets/CardioTemplateWide.vue';
import CardioTemplate from '@/widgets/CardioTemplate.vue';
import IntervalsTemplate from '@/widgets/IntervalsTemplate.vue';
import ActiveOrders from '@/widgets/ActiveOrders.vue';
import CreateGroupOrders from '@/widgets/CreateGroupOrders.vue';
import ActivePositions from '@/widgets/ActivePositions.vue';
import CreateOrder from "@/widgets/CreateOrder.vue";
import TopDeals from "@/widgets/TopDeals.vue";
import ElectronAPI from "@/widgets/ElectronAPI.vue";

import AlorStatsDiagram from './AlorStatsDiagram.vue';
//import AlorAdvantageousDeals from './AlorAdvantageousDeals.vue';
//import AlorTradeHistoryDiagram from './AlorTradeHistoryDiagram.vue';

//import { useCacheStore } from '@/stores/cacheStore';

import DataFabric from "@/components/DataFabric.vue";
import AlorTrades from "@/components/AlorTrades.vue";
import AlorOrderbooks from '@/components/AlorOrderbooks.vue';
import AlorCandles from '@/components/AlorCandles.vue';
import AlorQuotes from '@/components/AlorQuotes.vue';
import LevelsRenderer from "@/components/LevelsRenderer.vue";
import StatisticRenderer from "@/components/StatisticRenderer.vue";
import OrderManager from "@/components/OrderManager.vue";

export default {
  name: 'WorkspaceComponent',

  setup() {
    const ordersStore = useOrdersStore();
    const dataFabricStore = useDataFabricStore();
    const tradesStore = useTradesStore();
    const candlesStore = useCandlesStore();
    const orderbooksStore = useOrderbooksStore();
    const quotesStore = useQuotesStore();
    return {
      candlesStore,
      tradesStore,
      quotesStore,
      orderbooksStore,
      dataFabricStore,
      ordersStore,
    }
  },

  components: {
    OrderManager,
    TradingSectors,
    ChatTemplate,
    MeshbotManager,
    IntervalsTemplate,
    CardioTemplate,
    CardioTemplateWide,
    TopDeals,
    StatisticRenderer,
    DataFabric,
    LevelsRenderer,
    AlorTrades,
    AlorOrderbooks,
    AlorQuotes,
    AlorCandles,
    WidgetGrid,
    ActiveOrders,
    CreateGroupOrders,
    ActivePositions,
    CreateOrder,
    ElectronAPI,
    //SessionManager,
    //AlorTradesPlus,
    //AlorOrderbooksPlus,
    //AlorCandlesPlus,
    //AlorQuotesPlus,
    AlorStatsDiagram,
    //AlorAdvantageousDeals,
    //AlorTradeHistoryDiagram,
  },

  data() {
    return {

      minValue: null,
      maxValue: null,

      cachedSBERMax: null,
      cachedSBER: null,

      parentMetric: 0.5,

      graphData: [], // Массив данных для графика
      timers: [2, 3, 5, 7, 11], // Интервалы таймеров в секундах

      newChunkWide: [],

      // Пример тестового набора (имитация одного цикла ЭКГ)
      newChunk: [
          // — P-волна (небольшое положительное колебание) —
          0,      // изолиния
      0.02,
      0.05,   // пик P
      0.03,
      0.0,    // возврат к изолинии

      // — короткий интервал P–Q —
      0.0,
      0.0,

    // — QRS-комплекс —
    -0.05,  // небольшое отрицательное колебание (Q)
        0.8,    // крупный положительный пик (R)
        -0.2,   // лёгкий уход ниже изолинии (S)
        0.0,    // возвращаемся к изолинии

        // — T-волна —
        0.1,
        0.15,   // пик T
        0.1,
        0.05,
        0.0,     // возврат к изолинии

        0,      // изолиния
        0.02,
        0.05,   // пик P
        0.03,
        0.0,    // возврат к изолинии

  ],

      //newChunk: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, -0.2, -0.4, -0.6, -0.8, -1, -0.9, -0.8],

      isRunning: true,

      widgets: [
        { name: 'Create orders', param: 0, type: 5},
        { name: 'Active orders', param: 0, type: 6 },
        { name: 'Positions', param: 0, type: 7 },
        { name: 'Summary', param: 0, type: 8, gridColumn: 'span 4', gridRow: 'span 2' },
        { name: 'Aggregated events', param: 0, type: 18, gridColumn: 'span 1', gridRow: 'span 2' },
        { name: 'Template cardio', param: 0, type: 17, gridColumn: 'span 1', gridRow: 'span 2' },
        { name: 'Template cardio wide', param: 0, type: 19, gridColumn: 'span 3', gridRow: 'span 2' },
        { name: 'Intervals template', param: 0, type: 20, gridColumn: 'span 1', gridRow: 'span 1' },
        { name: 'Data Fabric', param: 0, type: 1 },
        //{ name: 'Alor Statistics', param: 0, type: 2, gridColumn: 'span 2' },
        { name: 'Manual order', param: 0, type: 3 },
        { name: 'Top deals', param: 0, type: 4, gridRow: 'span 3', gridColumn: 'span 2' },
        { name: 'Signals', param: 0, type: 9, gridRow: 'span 4'},
        { name: 'Trades', param: 0, type: 10, gridRow: 'span 2'},
        { name: 'Orderbooks', param: 0, type: 11, gridRow: 'span 2'},
        { name: 'Candles', param: 0, type: 12, gridRow: 'span 2'},
        { name: 'Quotes', param: 0, type: 13, gridRow: 'span 2'},
        { name: 'Cancel all', param: 0, type: 14 },
        { name: 'Виджет 15', param: 0, type: 15, gridRow: 'span 2' },
        { name: 'Timelines items', param: 0, type: 16, gridRow: 'span 3' },
        { name: 'Meshbot', param: 0, type: 21, gridColumn: 'span 2', gridRow: 'span 5' },
        { name: 'Chat AI', param: 0, type: 22, gridColumn: 'span 2', gridRow: 'span 4' },
        { name: 'Trading Sectors', param: 0, type: 23, gridColumn: 'span 2', gridRow: 'span 2' },
        { name: 'Electron API', param: 0, type: 24, gridColumn: 'span 1', gridRow: 'span 1' },
      ],


      /*[
          { "success": true, "data": { "message": "success", "orderNumber": "57360598695" } },
        { "success": true, "data": { "message": "success", "orderNumber": "57360598720" } } ],*/
      //[],


      selectedRows: [],
      //selectedRow: null,

      currentSortField: 'Ticker',
      currentSortDirection: 'asc',

      summaryTemplate: {
        tradeTickerFrequency: 1,
        tradeVolumeChunkSum: 2,
        tradeVolumeAbsoluteRubChunkSum: 449.74,
        tradePrice: 224.87,
        tradeSide: 'buy',
        //orderbookSpread: 0.010000000000019327,
        orderbookVolumeImbalance: -1406,
        //quoteMidPrice: 224.85000000000002,
        //quoteTicker: 'SBER',
        //quoteLastPrice: 224.83,
        candleClose: 224.84,
        candleVolume: 72,
        candleDirection: 'down',

        //candleBodySize: 0.03999999999999204,
        //candleRange: 0.03999999999999204,
        //tradeTicker: 'SBER',
        //tradeType: 'trade',
        //tradeTime: '2024-12-17T15:28:05.2710280Z',
        //candleHigh: 224.88,
        //candleLow: 224.84,
        //quoteTime: 1734449288,
        //quoteServerTime: 'Tue Dec 17 2024 19:28:10 GMT+0400 (Armenia Standard Time)',
        //quoteTimeDelay: 1732714841616,
        //candleOpen: 224.88,
        //quoteAsk: 224.86,
        //quoteBid: 224.84,
        //quoteType: 'quote',
        //orderbookAverageDepthPrice: 224.86256110908428,
        //quoteSpread: 0.020000000000010232,
        //orderbookTotalBidVolume: 2038,
        //orderbookTotalAskVolume: 3444,
        //orderbookTotalDepth: 5482,
        //orderbookBestDepth: 203,
        //orderbookAverageBidPrice: 224.77975956820413,
        //orderbookAverageAskPrice: 224.91155923344948,
        //tradeServerTime: 'Tue Dec 17 2024 19:28:05 GMT+0400 (Armenia Standard Time)',
        //tradeTimeDelay: 34,
        //orderbookBestBidPrice: 224.85,
        //orderbookBestAskPrice: 224.86,
        //tradeQty: 2,
      },

      inProgress: false,

      isSaveEnabled: false,

      profitPercent: 0.2,



      globalData: {},
      selectedTicker: 'SBER',
      summaryData: {},

      lastSaveTime: {},

      summaryDataHistory: [],
      globalDataHistory: [], // Массив для хранения истории globalData
      historyLimit: 20, // Настраиваемый параметр: сколько записей хранить

      signals: [],

      fields: [
        "trades.tradeSide",
        "trades.tradePrice"
      ],

    }
  },

  computed: {

    limitedAccumulatedTradesStats() {
      const stats = this.tradesStore?.accumulatedTradesStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },
    limitedAccumulatedTradesStats2() {
      const stats = this.tradesStore?.tradesStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },

    limitedAccumulatedOrderbooksStats() {
      const stats = this.orderbooksStore?.accumulatedOrderbooksStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },
    limitedAccumulatedOrderbooksStats2() {
      const stats = this.orderbooksStore?.orderbooksStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },

    limitedAccumulatedQuotesStats() {
      const stats = this.quotesStore?.accumulatedQuotesStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },
    limitedAccumulatedQuotesStats2() {
      const stats = this.quotesStore?.quotesStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },

    limitedAccumulatedCandlesStats() {
      const stats = this.candlesStore?.accumulatedCandlesStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },
    limitedAccumulatedCandlesStats2() {
      const stats = this.candlesStore?.candlesStats || {};
      return Object.fromEntries(Object.entries(stats).slice(0, 10));
    },

    summaryFields() {
      return Object.keys(this.summaryTemplate).sort();
    },

    sortedSummaryData() {

      // Преобразуем объект в массив пар [ticker, dataObject] и фильтруем 'IMOEX2'
      let entries = Object.entries(this.summaryData).filter(([ticker]) => ticker !== 'IMOEX2');

      // Проверяем, выбрано ли поле для сортировки
      if (this.currentSortField) {
        entries.sort((a, b) => {

          // Группируем выделенные строки в начало
          const aSelected = this.selectedRows.includes(a[0]);
          const bSelected = this.selectedRows.includes(b[0]);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;

          let valA, valB;

          // Если сортировка по 'ticker', используем a[0] и b[0]
          if (this.currentSortField === 'ticker') {
            valA = a[0];
            valB = b[0];
          } else {
            // Иначе сортируем по полю внутри dataObject
            valA = a[1][this.currentSortField];
            valB = b[1][this.currentSortField];
          }

          const aMissing = valA === undefined || valA === null;
          const bMissing = valB === undefined || valB === null;

          // Обработка отсутствующих значений
          if (aMissing && bMissing) return 0;
          if (aMissing) return 1; // a должно быть после b
          if (bMissing) return -1; // b должно быть после a

          // Сравнение числовых значений
          if (typeof valA === 'number' && typeof valB === 'number') {
            return this.currentSortDirection === 'asc' ? valA - valB : valB - valA;
          }

          // Сравнение строковых значений
          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();

          if (strA < strB) return this.currentSortDirection === 'asc' ? -1 : 1;
          if (strA > strB) return this.currentSortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return entries; //.splice(0,10);
    },

    buyFrequency() {
      // Подсчитываем частоту для "buy"
      const frequency = this.signals
          .filter(signal => signal.action === "buy" && signal.ticker)
          .reduce((acc, signal) => {
            acc[signal.ticker] = (acc[signal.ticker] || 0) + 1;
            return acc;
          }, {});

      // Сортируем по убыванию частоты
      return Object.fromEntries(
          Object.entries(frequency).sort(([, a], [, b]) => b - a)
      );
    },
    sellFrequency() {
      // Подсчитываем частоту для "sell"
      const frequency = this.signals
          .filter(signal => signal.action === "sell" && signal.ticker)
          .reduce((acc, signal) => {
            acc[signal.ticker] = (acc[signal.ticker] || 0) + 1;
            return acc;
          }, {});

      // Сортируем по убыванию частоты
      return Object.fromEntries(
          Object.entries(frequency).sort(([, a], [, b]) => b - a)
      );
    },

    sortedBuyVolume() {
      if (!this.summaryData || Object.keys(this.summaryData).length === 0) {
        return {}; // Возвращаем пустой объект, если данных еще нет
      }

      const sortedEntries = Object.entries(this.summaryData).sort((a, b) => {
        return (b[1].tradeVolume || 0) - (a[1].tradeVolume || 0);
      });

      return Object.fromEntries(sortedEntries);
    }
  },

  methods: {

    toggleSelection(rowId) {
      const index = this.selectedRows.indexOf(rowId);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
      } else {
        this.selectedRows.push(rowId);
      }
    },

    normalizeValue(newValue) {
      // Инициализация minValue и maxValue при первом вызове
      if (this.minValue === null || this.maxValue === null) {
        this.minValue = newValue;
        this.maxValue = newValue;
      }

      // Обновляем минимум и максимум
      if (newValue < this.minValue) this.minValue = newValue;
      if (newValue > this.maxValue) this.maxValue = newValue;

      // Нормируем значение
      const normalized = (newValue - this.minValue) / (this.maxValue - this.minValue);
      return normalized;
    },

    addMetric(timer, metric) {
      const now = Date.now();

      // Добавляем новое значение метрики в массив данных
      this.graphData.push({ timer, timestamp: now, metric });

      // Ограничиваем массив данными только за последние 30 секунд
      const cutoffTime = now - 30000; // 30 секунд
      while (this.graphData.length > 0 && this.graphData[0].timestamp < cutoffTime) {
        this.graphData.shift();
      }
    },
    handleNewData(newMetric) {
      // Обновляем график для всех таймеров
      const timers = [2, 3, 5, 7, 11]; // Интервалы таймеров
      timers.forEach((timer) => {
        this.addMetric(timer, newMetric);
      });
    },

    generateData(timer) {
      const now = Date.now();
      const metric = Math.random(); // Генерация случайной метрики
      this.graphData.push({ timer, timestamp: now, metric });

      // Ограничиваем данные заданным интервалом (например, 30 секунд)
      const cutoffTime = now - 30000; // 30 секунд назад
      while (this.graphData.length > 0 && this.graphData[0].timestamp < cutoffTime) {
        this.graphData.shift();
      }
    },
    startTimers() {
      this.timers.forEach((timer) => {
        setInterval(() => this.generateData(timer), timer * 1000); // Создаём интервал для каждого таймера
      });
    },

    simulateNewDataWide() {
      const randomChunk = Array.from({ length: 90 }, () => (Math.random() - 0.5) * 1.5);
      this.newChunkWide = randomChunk;
    },

    simulateNewData() {
      const randomChunk = Array.from({ length: 20 }, () => (Math.random() - 0.5) * 1.5);
      this.newChunk = randomChunk;
    },

    changeSort(field) {
      if (this.currentSortField === field) {
        // Если клик по тому же полю, то меняем направление
        this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Если выбрано новое поле, устанавливаем его и по умолчанию 'asc'
        this.currentSortField = field;
        this.currentSortDirection = 'asc';
      }
    },

    // Метод для добавления сигнала в массив с ограничением длины
    addSignal(signal) {

      const signals = [...this.signals.reverse()];

      signals.push(signal);

      // Ограничение длины массива до 200 элементов
      if (signals.length > 500) {
        signals.shift(); // Удалить первый (старый) элемент
      }

      this.signals = signals.reverse();
    },

    executeStrategies(data) {
      const avgVolume = 5000; // Условное среднее значение
      const avgRange = 0.1; // Средний диапазон свечи

      Object.keys(data).forEach((ticker) => {
        const tickerData = data[ticker];

        if(!tickerData.tradeTicker) return;

        // Запуск стратегий для каждого тикера
        this.imbalanceStrategy(tickerData);
        this.breakoutStrategy(tickerData);
        this.spreadScalpingStrategy(tickerData);
        //this.frequencyStrategy(tickerData);
        this.candlePatternStrategy(tickerData);

        this.volumeImbalanceStrategy(tickerData);
        this.narrowSpreadStrategy(tickerData);
        this.candleVolumeStrategy(tickerData, avgVolume);
        this.smallBodyBreakoutStrategy(tickerData);
        this.shadowStrategy(tickerData);
        this.tradeCostSpikeStrategy(tickerData);
        this.candleRangeStrategy(tickerData, avgRange);
        this.averagePriceImbalanceStrategy(tickerData);
        this.candleStrengthStrategy(tickerData);
        this.lastVolumeStrategy(tickerData);
      });
    },

// Пример корректировки одной стратегии (остальные стратегии аналогичны):
    volumeImbalanceStrategy(tickerData) {
      //console.log(tickerData);
      if (tickerData.orderbookTotalBidVolume > tickerData.orderbookTotalAskVolume * 1.5) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.orderbookBestAskPrice,
          reason: "Strong bid volume imbalance",
        });
      } else if (tickerData.orderbookTotalAskVolume > tickerData.orderbookTotalBidVolume * 1.5) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.orderbookBestBidPrice,
          reason: "Strong ask volume imbalance",
        });
      }
    },

// Пример корректировки еще одной стратегии:
    breakoutStrategy(tickerData) {
      if (tickerData.tradePrice > tickerData.candleHigh) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Breakout above candle high",
        });
      } else if (tickerData.tradePrice < tickerData.candleLow) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Breakout below candle low",
        });
      }
    },

    // 2. Стратегия на узком спреде
    narrowSpreadStrategy(tickerData) {
      if (tickerData.orderbookSpread < 0.01) {
        const action =
            tickerData.tradeTickerFrequencyBuy > tickerData.tradeTickerFrequencySell
                ? "buy"
                : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price:
              action === "buy"
                  ? tickerData.orderbookBestAskPrice
                  : tickerData.orderbookBestBidPrice,
          reason: "Narrow spread with " + action + " dominance",
        });
      }
    },

    // 3. Стратегия на основе объема свечи
    candleVolumeStrategy(tickerData, avgVolume) {
      if (tickerData.candleVolume > avgVolume * 1.5) {
        const action = tickerData.candleDirection === "up" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "High candle volume with direction " + tickerData.candleDirection,
        });
      }
    },

// 4. Стратегия на основе тела свечи
    smallBodyBreakoutStrategy(tickerData) {
      if (tickerData.candleBodySize < tickerData.candleRange * 0.1) {
        const action =
            tickerData.tradePrice > tickerData.candleHigh ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "Small body, possible breakout",
        });
      }
    },

// 5. Стратегия на основе тени свечи
    shadowStrategy(tickerData) {
      if (tickerData.candleLowerShadow > tickerData.candleUpperShadow * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Long lower shadow, reversal up",
        });
      } else if (tickerData.candleUpperShadow > tickerData.candleLowerShadow * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Long upper shadow, reversal down",
        });
      }
    },

// 6. Стратегия на частоте сделок
    tradeCostSpikeStrategy(tickerData) {
      //console.log(tickerData);
      if (tickerData.tradeVolumeAbsoluteRub > 1000000) {
        const action = tickerData.tradeSide === "buy" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          cost: tickerData.tradeVolumeAbsoluteRub,
          reason: "Trade cost spike, action: " + action,
        });
      }
    },

// 7. Стратегия на основе диапазона свечи
    candleRangeStrategy(tickerData, avgRange) {
      if (tickerData.candleRange > avgRange * 1.5) {
        const action = tickerData.candleDirection === "up" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "Large candle range, direction: " + tickerData.candleDirection,
        });
      }
    },

// 8. Стратегия на среднем дисбалансе цен в стакане
    averagePriceImbalanceStrategy(tickerData) {
      if (tickerData.tradePrice > tickerData.orderbookAverageAskPrice) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Price above average ask price",
        });
      } else if (tickerData.tradePrice < tickerData.orderbookAverageBidPrice) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Price below average bid price",
        });
      }
    },

// 9. Стратегия на основе силы свечи
    candleStrengthStrategy(tickerData) {
      if (tickerData.candleStrength > 0) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Candle strength positive",
        });
      } else if (tickerData.candleStrength < 0) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Candle strength negative",
        });
      }
    },

// 10. Стратегия на основе последних объемов
    lastVolumeStrategy(tickerData) {
      if (tickerData.tradeLastBuyVolume > tickerData.tradeLastSellVolume * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Last buy volume dominant",
        });
      } else if (tickerData.tradeLastSellVolume > tickerData.tradeLastBuyVolume * 2) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Last sell volume dominant",
        });
      }
    },

// Стратегия на дисбалансе объемов в стакане
    imbalanceStrategy(tickerData) {
      if (tickerData.orderbookVolumeImbalance > 1000) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.orderbookBestAskPrice,
          reason: "Volume Imbalance > 1000",
        });
      } else if (tickerData.orderbookVolumeImbalance < -1000) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.orderbookBestBidPrice,
          reason: "Volume Imbalance < -1000",
        });
      }
    },

// Скальпинг на основе спреда
    spreadScalpingStrategy(tickerData) {
      if (tickerData.orderbookSpread < 0.01) {
        const action = tickerData.tradeSide === "buy" ? "buy" : "sell";
        const price =
            action === "buy"
                ? tickerData.orderbookBestAskPrice
                : tickerData.orderbookBestBidPrice;
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price,
          reason: "Tight spread with " + action + " side dominance",
        });
      }
    },

// Стратегия на основании частоты сделок
    /*frequencyStrategy(tickerData) {
      const avgFrequency = 30; // Условное среднее значение частоты
      if (tickerData.tradeTickerFrequency > avgFrequency * 1.5) {
        const action = tickerData.tradeSide === "buy" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "High trade frequency, action: " + action,
        });
      }
    },*/

// Торговля по свечным паттернам
    candlePatternStrategy(tickerData) {
      if (
          tickerData.candleLowerShadow > 2 * (tickerData.candleRange - tickerData.candleBodySize)
      ) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "buy",
          price: tickerData.tradePrice,
          reason: "Bullish candle pattern",
        });
      } else if (
          tickerData.candleUpperShadow > 2 * (tickerData.candleRange - tickerData.candleBodySize)
      ) {
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action: "sell",
          price: tickerData.tradePrice,
          reason: "Bearish candle pattern",
        });
      }
    },

    processAdvantageousDifferences(differences, type) {
      if (!differences || Object.keys(differences).length === 0) {
        return; // Ничего не делаем, если данные пустые
      }

      // Хранилище для времени последнего сохранения тикеров
      this.lastSaveTime = this.lastSaveTime || {};

      const now = Date.now();
      const saveInterval = 60000; // 60 секунд
      const tickersToSave = {};

      for (const [ticker, data] of Object.entries(differences)) {
        // Пропускаем, если тикер был недавно сохранен
        if (this.lastSaveTime[ticker] && now - this.lastSaveTime[ticker] < saveInterval) {
          continue;
        }

        tickersToSave[ticker] = data;
        this.lastSaveTime[ticker] = now;
      }

      if (Object.keys(tickersToSave).length === 0) {
        return; // Нет тикеров для сохранения
      }

      // Отправляем каждый тикер с историей
      for (const [ticker, data] of Object.entries(tickersToSave)) {
        const dealData = {
          ticker,
          type, // Указываем тип сделки (Buy или Sell)
          ...data,
          saveTime: new Date().toISOString()
        };

        this.sendBestDeal(dealData); // Отправляем данные для сохранения
      }
    },

    async sendBestDeal(dealData) {

      if (!this.isSaveEnabled) {
        //console.log("Сохранение выключено. Данные не отправлены.");
        return;
      }

      try {

        const data = {
          dealData, // Текущая сделка
          summaryDataHistory: this.summaryDataHistory,
          globalDataHistory: this.globalDataHistory // История данных
        };

        console.log('Sending data:', JSON.stringify(data, null, 2));

        //const response = await fetch('https://signalfabric.com/best-deals/', {
        const response = await fetch('http://localhost:8080/best-deals/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        console.log('Payload size:', JSON.stringify(data).length, 'bytes');

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to save deal and history:', error.message);
          return;
        }

        const result = await response.json();
        console.log('Deal and history saved successfully:', result);
      } catch (err) {
        console.error('Error sending deal and history:', err);
      }
    },

    /*updateOrderbooksMetrics(orderbooksMetrics) {
      this.globalData.orderbooksMetrics = orderbooksMetrics;
    },

    updateQuotesMetrics(quotesMetrics) {
      this.globalData.quotesMetrics = quotesMetrics;
    },*/
    /*updateTradesMetrics(tradesMetrics) {
      this.globalData.tradesMetrics = tradesMetrics;
    },*/

    /*updateTradesStatistics(tradesStatistics) {
      this.globalData.tradesStatistics = tradesStatistics;
    },*/

    /*updateTradesCounters(tradesCounters) {
      this.globalData.tradesCounters = tradesCounters;
    },*/



    /*updateQuotesCounters(quotesCounters) {
      this.globalData.quotesCounters = quotesCounters;
    },*/



    async cancelAllOrders() {
      try {
        const exchange = 'MOEX'; // Укажите биржу
        const portfolio = 'D88141'; // Укажите портфель
        await this.ordersStore.cancelAllOrders(exchange, portfolio).then(() => {
          this.limitOrders = [];
        });

        //console.log("Все ордера успешно отменены:", result);
      } catch (error) {
        console.error("Ошибка при отмене всех ордеров:", error.message);
      }
    },


    selectTicker(ticker){
      this.selectedTicker = ticker;
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },

    updateSummaryData() {

      const data = {
        ...this.globalData,
        ...this.tradesStore,
        ...this.quotesStore,
        ...this.candlesStore,
        ...this.orderbooksStore
      };
      const summaryData = { ...this.summaryData };

      //console.log(data);

      // Оставляем только аггрегированные данные с тикерами
      const sectionsWithTickers = ['tradesMetrics', 'quotesMetrics', 'orderbooksMetrics', 'candlesMetrics']; // Укажите секции, содержащие тикеры

      for (const section in data) {
        if (!sectionsWithTickers.includes(section)) continue; // Пропускаем ненужные секции

        for (const ticker in data[section]) {
          if (!summaryData[ticker]) summaryData[ticker] = {}; // Инициализация объекта для тикера

          Object.assign(summaryData[ticker], data[section][ticker]); // Объединяем данные тикера
        }
      }

      this.summaryData = summaryData;

    },

  },

  mounted() {

    setInterval(() => {
      this.updateSummaryData();
    }, 1000);

    this.simulateNewData();
    setInterval(() => {
      this.simulateNewData();
    }, 2000);

    this.simulateNewDataWide();
    setInterval(() => {
      this.simulateNewDataWide();
    }, 7800);

    // Симуляция автоматического обновления данных
    setInterval(() => {

      const newMetric = Math.random(); // Здесь обновляется значение метрики

      this.handleNewData(newMetric);
    }, 1000); // Новые данные приходят каждые 1 секунду
  },

  watch: {
    'dataFabricStore.chunkEvents.SBER': {
      immediate: true,
      handler(newData) {
        if(newData) {
          this.cachedSBER = newData;
          if(this.cachedSBER > this.cachedSBERMax) this.cachedSBERMax = this.cachedSBER;
        }

        //console.log(newData);
      }
    },
    'tradesStore.tradesStatistics.advantageousBuyDifferences': {
      immediate: true,
      handler(newData) {
        this.processAdvantageousDifferences(newData, 'Buy');
      }
    },
    'tradesStore.tradesStatistics.advantageousSellDifferences': {
      immediate: true,
      handler(newData) {
        this.processAdvantageousDifferences(newData, 'Sell');
      }
    },

    /*summaryData: {
      deep: true,
      immediate: true,
      handler(newData) {

        if (!newData || Object.keys(newData).length === 0) {
          // Если данных нет, ничего не делаем
          return;
        }

        // Создаем срез данных
        const snapshot = {
          ...newData, // Копируем данные summaryData
          timestamp: new Date().toISOString() // Добавляем метку времени
        };

        this.executeStrategies(newData);

        // Добавляем срез в историю
        if(this.isSaveEnabled){
          this.summaryDataHistory.push(snapshot);

          // Ограничиваем длину истории
          if (this.summaryDataHistory.length > this.historyLimit) {
            this.summaryDataHistory.shift(); // Удаляем самый старый элемент
          }

        } else {
          this.summaryDataHistory = [];
        }

        //console.log('Updated summaryDataHistory:', this.summaryDataHistory);
      }
    },*/

    globalData: {
      deep: true,
      immediate: true,
      handler(newData) {
        if (!newData || Object.keys(newData).length === 0) {
          //console.log('Empty globalData, skipping history update.');
          return;
        }

        //throtthle
        if(this.inProgress) return;
        this.inProgress = true;
        setTimeout(()=>{
          this.inProgress = false;
        }, 500);


        this.updateSummaryData();
        //this.updateFlatObjectNested();

        // Создаем новый срез данных
        const snapshot = {
          tradesStatistics: newData.tradesStatistics || {},
          tradesCounters: newData.tradesCounters || {},
          orderbooksCounters: newData.orderbooksCounters || {},

          quotesCounters: newData.quotesCounters || {},
          timestamp: new Date().toISOString() // Метка времени для среза
        };

        // Добавляем срез в историю
        if(this.isSaveEnabled){
          this.globalDataHistory.push(snapshot);

          // Ограничиваем длину истории
          if (this.globalDataHistory.length > this.historyLimit) {
            this.globalDataHistory.shift(); // Удаляем самый старый элемент
          }

        } else {
          this.globalDataHistory = [];
        }


        //console.log('Updated globalDataHistory:', this.globalDataHistory);
      }
    }
  }

}
</script>
