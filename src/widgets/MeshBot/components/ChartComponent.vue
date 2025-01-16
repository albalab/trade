// Новый компонент для графика (ChartComponent.vue)
<template>
  <div>
    <div>
      <button class="btn" @click="startSimulation">Старт</button>
      <button class="btn" @click="stopSimulation">Стоп</button>
    </div>
    <strong>Текущая цена:</strong> {{ currentPriceStr }}
    <canvas ref="chartCanvas" width="600" height="300"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch, toRaw } from "vue";
import { useChartStore } from "@/stores/chartStore";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "ChartComponent",
  setup() {
    const chartStore = useChartStore();

    const chartCanvas = ref(null);
    let chartInstance = null;

    const currentPriceStr = computed(() => chartStore.currentPrice.toFixed(2));

    const initChartInstance = () => {
      const ctx = chartCanvas.value.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            { label: "Price", data: [], borderColor: "blue", fill: true },
            { label: "Buy Points", data: [], pointStyle: "triangle", pointRadius: 2 },
            { label: "Sell Points", data: [], pointStyle: "rect", pointRadius: 2 },
          ],
        },
        options: { animation: false, scales: { x: { type: "linear" }, y: { beginAtZero: false } } },
      });
    };

    const updateChart = () => {
      if (!chartInstance) return;
      chartInstance.data.datasets[0].data = toRaw(chartStore.priceData);
      chartInstance.data.datasets[1].data = toRaw(chartStore.buyPoints);
      chartInstance.data.datasets[2].data = toRaw(chartStore.sellPoints);
      chartInstance.update();
    };

    const startSimulation = chartStore.startSimulation;
    const stopSimulation = chartStore.stopSimulation;

    onMounted(() => {
      initChartInstance();
      watch(() => [chartStore.priceData, chartStore.buyPoints, chartStore.sellPoints], updateChart, {
        deep: true,
      });
    });

    onUnmounted(() => {
      if (chartInstance) chartInstance.destroy();
    });

    return { chartCanvas, currentPriceStr, startSimulation, stopSimulation };
  },
};
</script>

<style scoped>
canvas {
  border: 1px solid #ccc;
}
</style>
