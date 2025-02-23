<template>
  <div ref="chartContainer" style="width: 100%; height: 400px;" ></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as LightweightCharts from 'lightweight-charts'  // Импортируем всю библиотеку

const chartContainer = ref(null)
let chart = null
let candleSeries = null
 
const candlestickData = [
  { time: '2022-01-01', open: 50, high: 55, low: 48, close: 52 },
  { time: '2022-01-02', open: 52, high: 58, low: 51, close: 57 },
  { time: '2022-01-03', open: 57, high: 60, low: 54, close: 59 },
  { time: '2022-01-04', open: 59, high: 63, low: 57, close: 61 },
  { time: '2022-01-05', open: 61, high: 64, low: 59, close: 60 },
  { time: '2022-01-06', open: 60, high: 62, low: 56, close: 58 },
  { time: '2022-01-07', open: 58, high: 59, low: 55, close: 57 },
  { time: '2022-01-08', open: 57, high: 61, low: 56, close: 60 },
  { time: '2022-01-09', open: 60, high: 65, low: 59, close: 64 },
  { time: '2022-01-10', open: 64, high: 68, low: 63, close: 66 },
  { time: '2022-01-11', open: 66, high: 70, low: 65, close: 69 },
  { time: '2022-01-12', open: 69, high: 71, low: 67, close: 68 },
  { time: '2022-01-13', open: 68, high: 72, low: 66, close: 70 },
  { time: '2022-01-14', open: 70, high: 74, low: 69, close: 73 },
  { time: '2022-01-15', open: 73, high: 75, low: 71, close: 72 },
  { time: '2022-01-16', open: 50, high: 55, low: 48, close: 52 },
  { time: '2022-01-17', open: 52, high: 58, low: 51, close: 57 },
  { time: '2022-01-18', open: 57, high: 60, low: 54, close: 59 },
  { time: '2022-01-19', open: 59, high: 63, low: 57, close: 61 },
  { time: '2022-01-20', open: 61, high: 64, low: 59, close: 60 },
  { time: '2022-01-21', open: 60, high: 62, low: 56, close: 58 },
  { time: '2022-01-22', open: 58, high: 59, low: 55, close: 57 },
  { time: '2022-01-23', open: 57, high: 61, low: 56, close: 60 },
  { time: '2022-01-24', open: 60, high: 65, low: 59, close: 64 },
  { time: '2022-01-25', open: 64, high: 68, low: 63, close: 66 },
  { time: '2022-01-26', open: 66, high: 70, low: 65, close: 69 },
  { time: '2022-01-27', open: 69, high: 71, low: 67, close: 68 },
  { time: '2022-01-28', open: 68, high: 72, low: 66, close: 70 },
  { time: '2022-01-29', open: 70, high: 74, low: 69, close: 73 },
  { time: '2022-01-30', open: 73, high: 75, low: 71, close: 72 }
]

onMounted(() => {
  chart = LightweightCharts.createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 400,

    layout: {
      background: {
        type: LightweightCharts.ColorType.Solid,
        color: '#2b3043',
      },
      textColor: '#acacac',       // светлый текст
    },
    grid: {
      vertLines: {
        color: '#343950', // темные вертикальные линии сетки
      },
      horzLines: {
        color: '#363b53', // темные горизонтальные линии сетки
      },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: {
        color: '#a8a8a8',
        width: 1,
        style: LightweightCharts.LineStyle.Solid,
      },
      horzLine: {
        color: '#a1a2a2',
        width: 1,
        style: LightweightCharts.LineStyle.Solid,
      },
    },
    priceScale: {
      borderColor: '#666666',
    },
    timeScale: {
      borderColor: '#666666',
    },

  })

  // Используем новый метод addSeries с типом серии
  candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries)
  candleSeries.setData(candlestickData)

  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chart) {
    chart.remove()
  }
})

function resizeChart() {
  if (chartContainer.value) {
    chart.applyOptions({ width: chartContainer.value.clientWidth })
  }
}
</script>

<style>
#tv-attr-logo{
  display: none !important;
}
/* При необходимости добавьте стили */
</style>
