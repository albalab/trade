<template>
  <div style="width: 100%; position: relative; padding-bottom: 60%;">
    <AlorCandles v-show="false" />
    <div ref="chartContainer" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;"></div>
  </div>
</template>


<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as LightweightCharts from 'lightweight-charts';
import AlorCandles from "@/components/AlorCandles.vue";
import { useCandlesStore } from '@/stores/candlesStore';

// Объявляем пропсы для exchange, timeframe, from и to
const props = defineProps({
  exchange: { type: String, default: 'MOEX' },
  timeframe: { type: Number, default: 60 },
  from: { type: Number, default: () => Math.floor(Date.now() / 1000) - 86400 },
  to: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  targetTicker: { type: String, default: 'FLOT' },
});

const candlesStore = useCandlesStore();
//const targetTicker = 'FLOT';

const chartContainer = ref(null);
let chart = null;
let candleSeries = null;

const candlesHistory = ref({});

// Функция для получения исторических свечей
async function getHistoricalCandles(exchange, symbol, timeframe, from, to) {
  try {
    const response = await fetch('https://signalfabric.com/get-historical-candles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchange, symbol, timeframe, from, to }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Не удалось получить исторические свечи');
    }

    //console.log('Полученные исторические свечи:', data.data);
    return data.data;
  } catch (error) {
    console.error('Ошибка при получении истории:', error.message);
    throw error;
  }
}

// Преобразование свечи в формат графика
function transformCandle(candle) {
  return {
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };
}

// Обновление истории свечей
function updateCandlesHistory(newCandles, isHistorical = false) {
  newCandles.forEach((candle) => {
    if (candle.ticker === props.targetTicker || isHistorical) {
      candlesHistory.value[candle.time] = transformCandle(candle);
    }
  });

  return Object.values(candlesHistory.value).sort((a, b) => a.time - b.time);
}

// Флаг тестового режима
const isTestMode = ref(false);

// Тестовые данные
const candlestickData = [
  { time: '2022-01-01', open: 50, high: 55, low: 48, close: 52 },
  { time: '2022-01-02', open: 52, high: 58, low: 51, close: 57 },
  { time: '2022-01-03', open: 57, high: 60, low: 54, close: 59 },
  { time: '2022-01-04', open: 59, high: 63, low: 57, close: 61 },
  { time: '2022-01-05', open: 61, high: 64, low: 59, close: 60 },
];

onMounted(async () => {
  // Инициализация графика
  chart = LightweightCharts.createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
    //height: 400,
    layout: {
      background: { type: LightweightCharts.ColorType.Solid, color: '#2b3043' },
      textColor: '#acacac',
      fontSize: 8, // уменьшенный размер шрифта
      fontFamily: 'Arial, sans-serif',
    },
    grid: {
      vertLines: { color: '#343950' },
      horzLines: { color: '#363b53' },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#a8a8a8', width: 1, style: LightweightCharts.LineStyle.Solid },
      horzLine: { color: '#a1a2a2', width: 1, style: LightweightCharts.LineStyle.Solid },
    },
    priceScale: {
      visible: false,
      borderColor: '#666666',
      scaleMargins: { top: 0, bottom: 0 },
    },
    timeScale: {
      borderColor: '#666666',
      rightOffset: 5,
      leftOffset: 5,
      //fixLeftEdge: true,
    },
  });

  candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries);

  candleSeries.applyOptions({
    //lastValueVisible: true,
    //priceLineVisible: true,
    priceLineColor: 'rgba(200, 200, 200, 0.3)', // светло-серый цвет с прозрачностью
    //priceLineWidth: 1,
    priceLineStyle: LightweightCharts.LineStyle.Dotted,
  });

  if (isTestMode.value) {
    candleSeries.setData(candlestickData);
  } else {
    try {
      // Используем пропсы для передачи параметров в функцию получения свечей
      const historicalCandles = await getHistoricalCandles(props.exchange, props.targetTicker, props.timeframe, props.from, props.to);
      const initialData = updateCandlesHistory(historicalCandles, true);
      candleSeries.setData(initialData);
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
    }

    if (candlesStore.newCandles.length > 0) {
      const streamData = updateCandlesHistory(candlesStore.newCandles);
      candleSeries.setData(streamData);
    }

    chart.timeScale().fitContent();

  }

  window.addEventListener('resize', resizeChart);
});

if (!isTestMode.value) {
  watch(
      () => candlesStore.newCandles,
      (newCandles) => {
        //console.log('Новый пакет данных из стрима:', newCandles);
        newCandles.forEach((candle) => {
          if (candle.ticker === props.targetTicker) {
            const transformedCandle = transformCandle(candle);
            candlesHistory.value[candle.time] = transformedCandle;
            candleSeries.update(transformedCandle);
          }
        });
      },
      { deep: true }
  );
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  if (chart) {
    chart.remove();
  }
});

function resizeChart() {
  if (chartContainer.value) {
    const newWidth = chartContainer.value.clientWidth;
    const newHeight = chartContainer.value.clientHeight;
    chart.resize(newWidth, newHeight);

  }
}
</script>

<style>
#tv-attr-logo {
  display: none !important;
}
</style>
