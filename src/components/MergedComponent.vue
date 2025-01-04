<template>
  <div class="panels-container">

    <WidgetGrid :widgetsProps="widgets">
      <template #default="{ widget }">

        <div v-if="widget.type === 1"
             :data="widget">

          <h4>Data fabric stream</h4>

          Total: {{dataFabricStore.sourceCounts.sourceTotalCount}}<br>
          Candles: {{dataFabricStore.sourceCounts.sourceCandlesCount}}<br>
          Trades: {{dataFabricStore.sourceCounts.sourceTradesCount}}<br>
          Orderbooks: {{dataFabricStore.sourceCounts.sourceOrderbooksCount}}<br>
          Quotes: {{dataFabricStore.sourceCounts.sourceQuotesCount}}<br>

        </div>

        <div v-if="widget.type === 2"
             :data="widget">

          <h3>{{widget.name}}</h3>
          Candles: {{candlesStore.sourceCandlesCount}}<br>
          Trades: {{tradesStore.sourceTradesCount}}<br>
          Orderbooks: {{orderbooksStore.sourceOrderbooksCount}}<br>
          Quotes: {{quotesStore.sourceQuotesCount}}<br>

        </div>

        <div v-if="widget.type === 3"
             :data="widget">

          <h3>Manual order:</h3>
          <input v-model="priceOrder" placeholder="price"><br>
          <input v-model="exchange" placeholder="ticker"><br>
          <input v-model="sideOrder" placeholder="side"><br>
          <button class="btn"
                  @click="sendLimitOrder(1, priceOrder, exchange, 'MOEX', sideOrder, 'D88141')">
            Создать лимитку
          </button>
        </div>

        <div v-if="widget.type === 4"
             :data="widget">

          <!-- Включение/выключение сохранения -->
          <div style="margin-bottom: 10px;">
            <label>
              <input type="checkbox" v-model="isSaveEnabled" />
              Включить сохранение в базу данных
            </label>
          </div>

          <!--    {{buyFrequency}}<br>
              {{sellFrequency}}<br>-->

          <div style="margin: 0 0 5px;">
            <input type="text" v-model="profitPercent"/>
          </div>

          <!-- Топ 10 выгодных сделок (Покупки) -->
          <AlorAdvantageousDeals
              title="Выгодные сделки (Покупки)"
              :deals="tradesStore?.tradesStatistics?.advantageousBuyDifferences"
              operation="Buy"
              @select-ticker="selectTicker"
          />

          <!-- Топ 10 выгодных сделок (Продажи) -->
          <AlorAdvantageousDeals
              title="Выгодные сделки (Продажи)"
              :deals="tradesStore?.tradesStatistics?.advantageousSellDifferences"
              operation="Sell"
              @select-ticker="selectTicker"
          />

        </div>

        <div v-if="widget.type === 5"
             :data="widget">

          <div>
            <h3>Группа ордеров (захардкожена)</h3>
            <ul>
              <li v-for="(order, index) in groupOrders" :key="index">
                {{ index + 1 }}. {{ order.side }} {{ order.quantity }} {{ order.instrument.symbol }} по {{ order.price }} (портфель: {{ order.user.portfolio }})
              </li>
            </ul>
            <!-- Кнопка для отправки группы ордеров -->
            <button class="btn"
                    @click="sendGroupLimitOrders()">Создать лимитки</button>
          </div>

        </div>

        <div v-if="widget.type === 6"
             :data="widget">

          <div>


            <!--      <div>
                    <div v-for="item in limitOrders" :key="item?.data?.orderNumber">
                      {{item?.data?.orderNumber}}
                      <button @click="cancelOrders([item?.data?.orderNumber])">X</button>
                    </div>
                    <button @click="cancelOrders">Снять группу ордеров</button>
                  </div>-->

            <div class="limit-orders">
              <div class="limit-orders-head"
                   v-if="limitOrders.length">
                <label class="checkbox-label">
                  <input
                      class="checkbox"
                      type="checkbox"
                      :checked="areAllSelected"
                      @change="toggleAll($event)"
                  />
                  Выбрать все
                </label>
              </div>
              <div v-for="item in limitOrders"
                   :key="item.data?.orderNumber"
                   class="limit-orders-row">
                <div class="limit-order">
                  <label class="checkbox-label">
                    <input
                        class="checkbox"
                        type="checkbox"
                        :value="item.data?.orderNumber"
                        v-model="selectedOrders"
                    />
                    {{ item?.data?.orderNumber }} {{item?.data?.symbol}}
                  </label>
                </div>
                <div class="close-button">
                  <button @click="cancelOrders([item.data?.orderNumber])">X</button>
                </div>
              </div>

              <div v-if="limitOrders.length"
                   class="limit-orders-buttons">
                <!--          <button class="btn" @click="cancelAllOrders()">Снять все</button>-->
                <button class="btn"
                        :class="{'disabled': selectedOrders.length === 0}"
                        @click="(selectedOrders.length > 0) ? cancelOrders(selectedOrders) : null">
                  Снять лимитные заявки
                </button>
              </div>

            </div>

          </div>

        </div>

        <div v-if="widget.type === 7"
             :data="widget">

          <div>
            <h3>Real Positions:</h3>
            <PositionsStream />
          </div>
        </div>

        <div v-if="widget.type === 8"
             :data="widget">

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
                 :class="{'selected': item[0] === selectedRow}"
                 @click="selectedRow=item[0]"
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

        <div v-if="widget.type === 9"
             :data="widget">

          <div class="panel" style="height: 100px; overflow: auto;">

            <h2>Signals</h2>

            <AlorStatsDiagram
                :totalItemsStats="buyFrequency"
                :streamItemsStats="sellFrequency"
                @select-ticker="selectTicker"
            />

            <!--        <div class="items">
                      <div class="items-wrap"
                           v-for="(item,ticker) in sortedBuyVolume"
                           :key="item.id">
                        <div class="item" style="width: 50px; cursor: pointer;">{{ticker}}</div>
                        <div class="item">{{item?.candleClose}}</div>
                        <div class="item" :style="{color: item?.tradeSide === 'buy' ? 'green' : 'red' }">{{item?.tradeSide}}</div>
                        <div class="item">{{item?.tradeLastBuyVolume}}</div>
                        <div class="item">{{item?.tradeLastSellVolume}}</div>
                      </div>
                    </div>-->
          </div>
        </div>

        <div v-if="widget.type === 10"
             :data="widget">

          <div class="panel">
            <h2>Trades</h2>



            <!-- Статистика всех сделок -->
            <!--        <AlorTradeHistoryDiagram
                        title="Trade History Statistics (All)"
                        :tradeData="globalData?.tradesStatistics?.tradeHistory"
                        :buyData="globalData?.tradesStatistics?.tradeHistoryBuy"
                        :sellData="globalData?.tradesStatistics?.tradeHistorySell"
                    />-->


            <!--        <input type="text" v-model="selectedTicker"/>-->

            <!-- Статистика выбранного тикера -->
            <!--        <AlorTradeHistoryDiagram
                        title="Trade History Statistics (By Ticker)"
                        :tradeData="globalData?.tradesStatistics?.tickerStats[selectedTicker]?.tradeHistory || []"
                        :buyData="globalData?.tradesStatistics?.tickerStats[selectedTicker]?.tradeHistoryBuy || []"
                        :sellData="globalData?.tradesStatistics?.tickerStats[selectedTicker]?.tradeHistorySell || []"
                        :showTickerInput="true"
                    />-->

            <!-- Статистика покупок -->
            <!--        <AlorTradeHistoryDiagram
                        title="Trade History Statistics (Buy)"
                        type="buy"
                        :tradeData="globalData?.tradesStatistics?.tradeHistoryBuy"
                    />-->

            <!-- Статистика продаж -->
            <!--        <AlorTradeHistoryDiagram
                        title="Trade History Statistics (Sell)"
                        type="sell"
                        :tradeData="globalData?.tradesStatistics?.tradeHistorySell"
                    />-->


            <AlorStatsDiagram
                :totalItemsStats="tradesStore?.accumulatedTradesStats"
                :streamItemsStats="tradesStore?.tradesStats"
                @select-ticker="selectTicker"
            />

            <AlorTrades :profitPercent="profitPercent"/>
          </div>

        </div>

        <div v-if="widget.type === 11"
             :data="widget">

          <div class="panel">

            <h2>Orderbooks</h2>

            <AlorStatsDiagram
                :totalItemsStats="orderbooksStore?.accumulatedOrderbooksStats"
                :streamItemsStats="orderbooksStore?.orderbooksStats"
                @select-ticker="selectTicker"
            />

            <AlorOrderbooks />

            <DataFabric />
          </div>
        </div>

        <div v-if="widget.type === 12"
             :data="widget">

          <div class="panel">

            <h2>Candles</h2>

            <AlorStatsDiagram
                :totalItemsStats="candlesStore?.accumulatedCandlesStats"
                :streamItemsStats="candlesStore?.candlesStats"
                @select-ticker="selectTicker"
            />

            <AlorCandles />
          </div>
        </div>

        <div v-if="widget.type === 13"
             :data="widget">

          <div class="panel">

            <h2>Quotes</h2>

            <AlorStatsDiagram
                :totalItemsStats="quotesStore?.accumulatedQuotesStats"
                :streamItemsStats="quotesStore?.quotesStats"
                @select-ticker="selectTicker"
            />

            <AlorQuotes />

          </div>
        </div>

        <div v-if="widget.type === 14"
             :data="widget">

          <button class="btn"
                  @click="cancelAllOrders()">
            Снять все
          </button>
        </div>

        <div :data="widget"
             v-if="widget.type === 15">
          <div style="padding: 10px; height: 100px; overflow: hidden;">
            <div v-for="(item, key) in summaryData[selectedTicker]" :key="key">
              {{key}}: {{item}}
            </div>
          </div>
        </div>

        <div v-if="widget.type === 16"
             :data="widget">

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


//import SessionManager from './SessionManager';

import {
  sendLimitOrder,
  cancelAllOrders,
  sendGroupLimitOrders,
  cancelGroupOrders
} from '../modules/LimitOrderModule.js';

//import AlorTradesPlus from './AlorTradesPlus.vue';

import WidgetGrid from './WidgetGrid.vue';

import PositionsStream from './PositionsStream.vue';
import AlorStatsDiagram from './AlorStatsDiagram.vue';
import AlorAdvantageousDeals from './AlorAdvantageousDeals.vue';
//import AlorTradeHistoryDiagram from './AlorTradeHistoryDiagram.vue';

//import { useCacheStore } from '@/stores/cacheStore';
import DataFabric from "@/components/DataFabric.vue";
import AlorTrades from "@/components/AlorTrades.vue";
import AlorOrderbooks from '@/components/AlorOrderbooks.vue';
import AlorCandles from '@/components/AlorCandles.vue';
import AlorQuotes from '@/components/AlorQuotes.vue';
import LevelsRenderer from "@/components/LevelsRenderer.vue";

export default {
  name: 'MergedComponent',

  setup() {
    const dataFabricStore = useDataFabricStore();
    const tradesStore = useTradesStore();
    const candlesStore = useCandlesStore();
    const orderbooksStore = useOrderbooksStore();
    const quotesStore = useQuotesStore();
    return { candlesStore, tradesStore, quotesStore, orderbooksStore, dataFabricStore, }
  },

  components: {
    PositionsStream,
    DataFabric,
    LevelsRenderer,
    AlorTrades,
    AlorOrderbooks,
    AlorQuotes,
    AlorCandles,
    WidgetGrid,

    //SessionManager,
    //AlorTradesPlus,
    //AlorOrderbooksPlus,
    //AlorCandlesPlus,
    //AlorQuotesPlus,
    AlorStatsDiagram,
    AlorAdvantageousDeals,
    //AlorTradeHistoryDiagram,
  },

  data() {
    return {

      widgets: [
        { name: 'Data Fabric', param: 0, type: 1 },
        { name: 'Alor statistics', param: 0, type: 2, gridColumn: 'span 2' },
        { name: 'Manual order', param: 0, type: 3, gridRow: 'span 2' },
        { name: 'Top deals', param: 0, type: 4, gridRow: 'span 3' },
        { name: 'Orders creator', param: 0, type: 5 },
        { name: 'Limit orders', param: 0, type: 6 },
        { name: 'Positions', param: 0, type: 7 },
        { name: 'Summary', param: 0, type: 8, gridColumn: 'span 4', gridRow: 'span 2' },
        { name: 'Signals', param: 0, type: 9, gridRow: 'span 4'},
        { name: 'Trades', param: 0, type: 10, gridRow: 'span 4'},
        { name: 'Orderbooks', param: 0, type: 11, gridRow: 'span 4'},
        { name: 'Candles', param: 0, type: 12, gridRow: 'span 4'},
        { name: 'Quotes', param: 0, type: 13, gridRow: 'span 4'},
        { name: 'Cancel all', param: 0, type: 14 },
        { name: 'Виджет 15', param: 0, type: 15 },
        { name: 'Виджет 16', param: 0, type: 16 },
      ],

      selectedOrders: [],
      limitOrders: [
        /*{
          data: {
            symbol: "SBER",
            orderNumber: 3214543,
          }
        },
        {
          data: {
            symbol: "LKOH",
            orderNumber: 3214547,
          }
        }*/
      ],

      /*[
          { "success": true, "data": { "message": "success", "orderNumber": "57360598695" } },
        { "success": true, "data": { "message": "success", "orderNumber": "57360598720" } } ],*/
      //[],

      groupOrders: [
        {
          side: "buy",
          quantity: 1,
          price: 269,
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
          price: 105,
          instrument: {
            symbol: "MTLR",
            exchange: "MOEX",
            instrumentGroup: "TQBR",
          },
          user: {
            portfolio: "D88141",
          },
          timeInForce: "oneday",
        }],

      selectedRow: null,

      currentSortField: 'Ticker',
      currentSortDirection: 'asc',

      summaryTemplate: {
        tradeTickerFrequency: 1,
        tradeVolumeChunkSum: 2,
        tradeVolumeAbsoluteRubChunkSum: 449.74,
        tradePrice: 224.87,
        tradeSide: 'buy',
        orderbookSpread: 0.010000000000019327,
        orderbookVolumeImbalance: -1406,
        //quoteMidPrice: 224.85000000000002,
        //quoteTicker: 'SBER',
        quoteLastPrice: 224.83,
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

      sideOrder: 'buy',
      priceOrder: null,
      exchange: '',

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

    areAllSelected() {
      return this.selectedOrders.length === this.limitOrders.length && this.limitOrders.length > 0;
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

      return entries.splice(0,10);
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

    toggleAll(event) {
      if (event.target.checked) {
        this.selectedOrders = this.limitOrders.map(item => item.data.orderNumber);
      } else {
        this.selectedOrders = [];
      }
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

    async sendGroupLimitOrders() {
      try {

        //summaryData[selectedTicker]?.orderbookAverageBidPrice
        const result = await sendGroupLimitOrders(this.groupOrders);

        //console.log("Группа лимитных ордеров отправлена:", result.data);

        const limitOrders = [];

        result.data.forEach( (order) => {
          if(order.data?.message === 'success' && order.data?.orderNumber){
            limitOrders.push(order);
          }
        });

        this.limitOrders = limitOrders;

      } catch (error) {
        console.error("Ошибка при отправке группы лимитных ордеров:", error.message);
      }
    },

    async sendLimitOrder(volume, price, ticker, exchange, side, portfolio) {
      try {
        await sendLimitOrder(volume, price, ticker, exchange, side, portfolio);
        //console.log("Лимитный ордер отправлен:", result);
      } catch (error) {
        console.error("Ошибка при отправке лимитного ордера:", error.message);
      }
    },
    async cancelAllOrders() {
      try {
        const exchange = 'MOEX'; // Укажите биржу
        const portfolio = 'D88141'; // Укажите портфель
        await cancelAllOrders(exchange, portfolio).then(() => {
          this.limitOrders = [];
        });

        //console.log("Все ордера успешно отменены:", result);
      } catch (error) {
        console.error("Ошибка при отмене всех ордеров:", error.message);
      }
    },
    async cancelOrders(orderIds) {
      try {

        const params = {
              orderIds: orderIds,
              portfolio: 'D88141', // Идентификатор портфеля
              exchange: 'MOEX', // Биржа MOEX
              stop: false // Является ли стоп-заявкой
        };
        //params.orderIds = ['57350744044', '57350744110'];

        const response = await cancelGroupOrders(params);

        if (response.success) {
          // Собрать список успешно удаленных orderId из response.data
          const ordersToRemove = response.data
              //.filter(order => order.success) // Оставить только успешные
              .map(order => order.orderId); // Извлечь orderId

          if (ordersToRemove.length > 0) {
            // Фильтровать limitOrders, исключая те, которые есть в ordersToRemove
            this.limitOrders = this.limitOrders.filter(
                order => !ordersToRemove.includes(order.data.orderNumber)
            );
          }
        }


        //console.log("Результат отмены ордеров:", response);

        if(response.success){
          if(response.data.success){
            console.log(response.data.orderId);
          }
        }

      } catch (error) {
        console.error("Ошибка при отмене ордеров:", error.message);
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

    updateGroupOrders() {
      const groupOrders = [...this.groupOrders];
      //console.log(groupOrders);
      groupOrders.forEach((order) => {
        if(this.summaryData[order.instrument.symbol]?.orderbookBestBidPrice){
          order.price = this.summaryData[order.instrument.symbol]?.orderbookBestBidPrice;
        }
      });

    },

  },

  mounted() {
    setInterval(() => {
      this.updateSummaryData();
      this.updateGroupOrders();
    }, 1000);

  },

  watch: {
    limitOrders() {
      this.selectedOrders = [];
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

    summaryData: {
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
    },

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
