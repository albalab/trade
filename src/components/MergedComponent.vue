<template>
  <div class="panels-container">

    <div style="height: 200px; overflow: auto;">
      <div v-for="signal in signals" :key="signal.id">
        {{signal}}
      </div>
    </div>

    <div class="panels-grid">

      <div class="panel" style="height: 600px; overflow: auto;">

        <h2>Signals</h2>

        <AlorStatsDiagram
            :totalCounts="buyFrequency"
            :streamObjects="sellFrequency"
            @select-ticker="selectTicker"
        />

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
            :deals="globalData?.tradesStatistics?.advantageousBuyDifferences"
            operation="Buy"
            @select-ticker="selectTicker"
        />

        <!-- Топ 10 выгодных сделок (Продажи) -->
        <AlorAdvantageousDeals
            title="Выгодные сделки (Продажи)"
            :deals="globalData?.tradesStatistics?.advantageousSellDifferences"
            operation="Sell"
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
            :totalCounts="globalData?.tradesCounters?.tradesCounters"
            :streamObjects="globalData?.tradesCounters?.tradesStats"
            @select-ticker="selectTicker"
        />

        <AlorTradesPlus
            :profitPercent="profitPercent"
            @update-trades-statistics="updateTradesStatistics"
            @update-trades-counters="updateTradesCounters"
            @update-trades-summary="updateTrades"/>
      </div>
      <div class="panel">

        <h2>Orderbooks</h2>

        <AlorStatsDiagram
            :totalCounts="globalData?.orderbooksCounters?.orderbooksCounters"
            :streamObjects="globalData?.orderbooksCounters?.orderbooksStats"
            @select-ticker="selectTicker"
        />

        <AlorOrderbooksPlus
            @update-orderbooks-counters="updateOrderbooksCounters"
            @update-orderbooks-summary="updateOrderbooks"/>
      </div>
      <div class="panel">

        <h2>Candles</h2>

        <AlorStatsDiagram
            :totalCounts="globalData?.candlesCounters?.candlesCounters"
            :streamObjects="globalData?.candlesCounters?.candlesStats"
            @select-ticker="selectTicker"
        />

        <AlorCandlesPlus
            @update-candles-counters="updateCandlesCounters"
            @update-candles-summary="updateCandles"/>
      </div>
      <div class="panel">

        <h2>Quotes</h2>

        <AlorStatsDiagram
            :totalCounts="globalData?.quotesCounters?.quotesCounters"
            :streamObjects="globalData?.quotesCounters?.quotesStats"
            @select-ticker="selectTicker"
        />

        <AlorQuotesPlus
            @update-quotes-counters="updateQuotesCounters"
            @update-quotes-summary="updateQuotes"/>
      </div>
    </div>


    <div style="padding: 10px;">
      <input v-model="priceOrder" placeholder="price"><br>
      <input v-model="tickerOrder" placeholder="ticker"><br>
      <input v-model="sideOrder" placeholder="side"><br>
      <button @click="sendLimitOrder(1, priceOrder, tickerOrder, 'MOEX', sideOrder, 'D88141')">
        Отправить лимитный ордер
      </button>
    </div>

    <div style="margin: 0 0 10px;">
      <button @click="resetCache">Reset Cache</button>
    </div>

<!--    <div style="margin: 0 0 10px;">
      <div v-for="(item, key) in {
        ...globalData.tradesCounters,
        ...globalData.candlesCounters,
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

  </div>
</template>

<script>
import { sendLimitOrder as importedSendLimitOrder } from '../modules/LimitOrderModule.js';
import AlorTradesPlus from './AlorTradesPlus.vue';
import AlorOrderbooksPlus from './AlorOrderbooksPlus.vue';
import AlorCandlesPlus from './AlorCandlesPlus.vue';
import AlorQuotesPlus from './AlorQuotesPlus.vue';
import AlorStatsDiagram from './AlorStatsDiagram.vue';
import AlorAdvantageousDeals from './AlorAdvantageousDeals.vue';
//import AlorTradeHistoryDiagram from './AlorTradeHistoryDiagram.vue';

import { useCacheStore } from '@/stores/cacheStore';

export default {
  name: 'MergedComponent',

  setup() {
    const cacheStore = useCacheStore();

    // Функция для сброса состояния в Pinia
    const resetCache = () => {
      cacheStore.resetStore(); // Вызов метода сброса в Pinia
    };

    return {
      resetCache,
    };
  },

  components: {
    AlorTradesPlus,
    AlorOrderbooksPlus,
    AlorCandlesPlus,
    AlorQuotesPlus,
    AlorStatsDiagram,
    AlorAdvantageousDeals,
    //AlorTradeHistoryDiagram,
  },

  data() {
    return {

      isSaveEnabled: false,

      profitPercent: 0.2,

      sideOrder: 'buy',
      priceOrder: null,
      tickerOrder: '',

      globalData: {},
      selectedTicker: 'SBER',
      summaryData: {},

      lastSaveTime: {},

      summaryDataHistory: [],
      globalDataHistory: [], // Массив для хранения истории globalData
      historyLimit: 20, // Настраиваемый параметр: сколько записей хранить

      signals: [],
    }
  },

  computed: {
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

    // Метод для добавления сигнала в массив с ограничением длины
    addSignal(signal) {
      this.signals.push(signal);

      // Ограничение длины массива до 200 элементов
      if (this.signals.length > 200) {
        this.signals.shift(); // Удалить первый (старый) элемент
      }
    },

    executeStrategies(data) {
      const avgVolume = 5000; // Условное среднее значение
      const avgFrequency = 30; // Средняя частота сделок
      const avgRange = 0.1; // Средний диапазон свечи

      Object.keys(data).forEach((ticker) => {
        const tickerData = data[ticker];

        if(!tickerData.tradeTicker) return;

        // Запуск стратегий для каждого тикера
        this.imbalanceStrategy(tickerData);
        this.breakoutStrategy(tickerData);
        this.spreadScalpingStrategy(tickerData);
        this.frequencyStrategy(tickerData);
        this.candlePatternStrategy(tickerData);

        this.volumeImbalanceStrategy(tickerData);
        this.narrowSpreadStrategy(tickerData);
        this.candleVolumeStrategy(tickerData, avgVolume);
        this.smallBodyBreakoutStrategy(tickerData);
        this.shadowStrategy(tickerData);
        this.tradeFrequencySpikeStrategy(tickerData, avgFrequency);
        this.candleRangeStrategy(tickerData, avgRange);
        this.averagePriceImbalanceStrategy(tickerData);
        this.candleStrengthStrategy(tickerData);
        this.lastVolumeStrategy(tickerData);
      });
    },

// Пример корректировки одной стратегии (остальные стратегии аналогичны):
    volumeImbalanceStrategy(tickerData) {
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
    tradeFrequencySpikeStrategy(tickerData, avgFrequency) {
      if (tickerData.tradeTickerFrequency > avgFrequency * 1.5) {
        const action = tickerData.tradeSide === "buy" ? "buy" : "sell";
        this.addSignal({
          ticker: tickerData.tradeTicker,
          action,
          price: tickerData.tradePrice,
          reason: "Trade frequency spike, action: " + action,
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
    frequencyStrategy(tickerData) {
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
    },

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

        //const response = await fetch('https://refine.video/best-deals/', {
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

    updateOrderbooks() {
      //this.globalData.orderbooks = orderbooks;
    },
    updateCandles() {
      //this.globalData.candles = candles;
    },
    updateQuotes() {
      //this.globalData.quotes = quotes;
    },
    updateTrades(trades) {
      this.globalData.trades = trades;
    },

    updateTradesStatistics(tradesStatistics) {
      this.globalData.tradesStatistics = tradesStatistics;
    },

    updateTradesCounters(tradesCounters) {
      this.globalData.tradesCounters = tradesCounters;
    },
    updateCandlesCounters(candlesCounters) {
      this.globalData.candlesCounters = candlesCounters;
    },
    updateOrderbooksCounters(orderbooksCounters) {
      this.globalData.orderbooksCounters = orderbooksCounters;
    },
    updateQuotesCounters(quotesCounters) {
      this.globalData.quotesCounters = quotesCounters;
    },

    sendLimitOrder: importedSendLimitOrder,

    selectTicker(ticker){
      this.selectedTicker = ticker;
      window.parent.postMessage({
        'selectTicker': ticker
      }, "*");
    },

    updateSummaryData() {
      const data = { ...this.globalData };
      const result = { ...this.summaryData };

      // Оставляем только аггрегированные данные с тикерами
      const tickerSections = ['trades', 'candles', 'orderbooks', 'quotes']; // Укажите секции, содержащие тикеры

      for (const section in data) {
        if (!tickerSections.includes(section)) continue; // Пропускаем ненужные секции

        for (const ticker in data[section]) {
          if (!result[ticker]) result[ticker] = {}; // Инициализация объекта для тикера
          Object.assign(result[ticker], data[section][ticker]); // Объединяем данные тикера
        }
      }

      this.summaryData = result;

    },

  },


  watch: {
    'globalData.tradesStatistics.advantageousBuyDifferences': {
      immediate: true,
      handler(newData) {
        this.processAdvantageousDifferences(newData, 'Buy');
      }
    },
    'globalData.tradesStatistics.advantageousSellDifferences': {
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

        this.updateSummaryData();

        // Создаем новый срез данных
        const snapshot = {
          tradesStatistics: newData.tradesStatistics || {},
          tradesCounters: newData.tradesCounters || {},
          orderbooksCounters: newData.orderbooksCounters || {},
          candlesCounters: newData.candlesCounters || {},
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

<style>

.panels-container{
  padding: 20px;
  background: #e5e5e5;
}
.panels-grid{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}
.panel{
  margin: 4px;
  padding: 10px;
  border: solid 1px #ccc;
  border-radius: 6px;
  background: white;
}

.items{
  display: table;
}
.items-wrap{
  display: table-row;
  border-bottom: solid 1px #eee;
}
.items .item{
  display: table-cell;
  line-height: 10px;
  padding: 0 10px;
}


.container {
  position: relative;
}

.row {
  margin: 0 0 2px;
  display: grid;
}

.block {
  height: 10px;
  background: #ccc;
}

.buy-bar {
  height: 50%;
  background-color: green;
}

.sell-bar {
  height: 50%;
  background-color: red;
}

.trade-cell{
  width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
}
.select-ticker{
  cursor: pointer;
}
</style>
