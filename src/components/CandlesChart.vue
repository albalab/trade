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
  // Дополнительные данные
]

onMounted(() => {
  chart = LightweightCharts.createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 400,

    layout: {
      background: '#000000', // тёмный фон
      textColor: '#ffffff',       // светлый текст
    },
    grid: {
      vertLines: {
        color: '#444444', // темные вертикальные линии сетки
      },
      horzLines: {
        color: '#444444', // темные горизонтальные линии сетки
      },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: {
        color: '#ffffff',
        width: 1,
        style: LightweightCharts.LineStyle.Solid,
      },
      horzLine: {
        color: '#ffffff',
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

<style scoped>
/* При необходимости добавьте стили */
</style>
