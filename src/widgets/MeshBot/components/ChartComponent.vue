<template>
  <div v-if="isActiveBot" class="chart">
    <canvas ref="chartCanvas" width="600" height="300"></canvas>
  </div>
</template>

<script>
import { defineComponent, markRaw, toRaw } from 'vue'
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);
import {useMeshbotStore} from "@/widgets/MeshBot/stores/meshbotStore";


const chartConfig = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Price",
        data: [],
        borderColor: "rgba(100,181,246,0.85)",
        pointRadius: 0,
        borderWidth: 1,
        backgroundColor: "rgba(100,181,246,0.05)",
        fill: true,
      },
      {
        label: "Lines",
        data: [],
        borderColor: "rgba(146,30,255,0.7)",
        borderDash: [5, 0],
        borderWidth: 1,
        showLine: true,
        pointRadius: 0,
        fill: false,
        spanGaps: false,
      },
      {
        label: "Buy Points",
        data: [],
        showLine: false,
        pointStyle: "triangle",
        pointRadius: 2,
        //borderColor: "rgba(129,199,132,0.5)",
        //backgroundColor: "rgba(129,199,132,0.5)",
      },
      {
        label: "Sell Points",
        data: [],
        showLine: false,
        pointStyle: "rect",
        pointRadius: 2,
        //borderColor: "rgba(229,115,115,0.5)",
        //backgroundColor: "rgba(229,115,115,0.5)",
      },

      {
        label: "Vertical Trades",
        data: [],
        showLine: true,       // рисуем линию между точками
        pointRadius: 0,       // убираем точки
        borderDash: [],       // хотим сплошную линию
        borderWidth: 1,
        fill: false,
        spanGaps: false,
      }
    ],
  },
  options: {
    animation: false,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      clip: {
        left: true,
        right: true,
        top: true,
        bottom: true,
      },
      legend: {
        display: false, // Отключить легенду
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Убираем разделители тысяч в подсказках
              label += context.parsed.y.toLocaleString('ru-RU', { useGrouping: false });
            }
            return label;
          }
        }
      },
/*zoom: {
pan: {
  enabled: true,        // Включить панорамирование
      mode: 'x',            // Панорамирование только по оси X
      speed: 10,            // Скорость панорамирования
      threshold: 5,         // Чувствительность к началу панорамирования
},
zoom: {
  wheel: {
    enabled: true,      // Включить масштабирование колесом мыши
        speed: 0.1,         // Скорость масштабирования
  },
  pinch: {
    enabled: true,      // Включить масштабирование пальцами на сенсорных устройствах
  },
  drag: {
    enabled: false,     // Отключить масштабирование перетаскиванием
  },
  mode: 'x',            // Масштабирование только по оси X
      overScaleMode: 'y',   // Предотвращение масштабирования за пределы Y
      limits: {
    x: { minRange: 1 }, // Минимальный диапазон масштабирования по оси X
  },
},
},*/

},
scales: {
  x: {
    type: "linear",
        position: "bottom",
        grid: {
      color: "rgba(255, 255, 255, 0.05)",
    },
  },
  y: {
    beginAtZero: true,
        grid: {
      color: "rgba(255, 255, 255, 0.05)",
    },
    ticks: {
      // Убираем разделители тысяч на оси Y
      callback: function(value) {
        return value.toLocaleString('ru-RU', { useGrouping: false });
      }
    }
  },
},
},
};
  /*
const chartConfig = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Price",
        data: [],
        borderColor: "rgba(100,181,246,0.85)",
        pointRadius: 0,
        borderWidth: 1,
        backgroundColor: "rgba(100,181,246,0.05)",
        fill: true,
      },
      {
        label: "Lines",
        data: [],
        borderColor: "rgba(146,30,255,0.7)",
        borderDash: [5, 0],
        borderWidth: 1,
        showLine: true,
        pointRadius: 0,
        fill: false,
        spanGaps: false,
      },
      {
        label: "Buy Points",
        data: [],
        showLine: false,
        pointStyle: "triangle",
        pointRadius: 2,
      },
      {
        label: "Sell Points",
        data: [],
        showLine: false,
        pointStyle: "rect",
        pointRadius: 2,
      },
      {
        label: "Vertical Trades",
        data: [],
        showLine: true,
        pointRadius: 0,
        borderDash: [],
        borderWidth: 1,
        fill: false,
        spanGaps: false,
      }
    ],
  },
  options: {
    animation: false,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      clip: {
        left: true,
        right: true,
        top: true,
        bottom: true,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString('ru-RU', { useGrouping: false });
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('ru-RU', { useGrouping: false });
          }
        }
      },
    },
  },
};*/

export default defineComponent({
  name: 'ChartComponent',

  props: {
    isActiveBot: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const meshbotStore = useMeshbotStore();
    return {
      meshbotStore,
    };
  },

  data() {
    return {
      intervalChartUpdate: 50,
      chartInstance: null,
      chartTimer: null,
      forwardPadding: 10,

    };
  },

  mounted() {
    if (this.isActiveBot) {
      this.$nextTick(() => {
        this.initChartInstance();
        this.startChartUpdate();
        window.addEventListener("resize", this.updateChartSize);
      });
    }
  },

  beforeUnmount() {
    this.cleanUpChart();
    window.removeEventListener("resize", this.updateChartSize);
  },

  watch: {
    // Наблюдаем за изменением isActiveBot
    isActiveBot(newVal) {
      if (newVal) {
        // Если вкладка стала активной
        this.$nextTick(() => {
          this.initChartInstance();
          this.startChartUpdate();
          window.addEventListener("resize", this.updateChartSize);
        });
      } else {
        // Если вкладка стала неактивной
        this.cleanUpChart();
        window.removeEventListener("resize", this.updateChartSize);
      }
    },
  },
  methods: {
    initChartInstance() {
      if (!this.$refs.chartCanvas) {
        console.error("Canvas not found. Chart initialization skipped.");
        return;
      }
      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chartInstance = markRaw(new Chart(ctx, chartConfig));
    },
    destroyChartInstance() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },
    updateChartSize() {
      if (this.chartInstance) {
        const canvas = this.$refs.chartCanvas;
        if (canvas) {
          canvas.width = canvas.parentElement.offsetWidth;
          canvas.height = canvas.parentElement.offsetHeight;
          this.chartInstance.resize();
        }
      }
    },
    startChartUpdate() {
      this.updateChart(); // Первоначальное обновление
      if (!this.chartTimer) {
        this.chartTimer = setInterval(this.updateChart, this.intervalChartUpdate); // Интервал обновления графика
      }
    },
    stopChartUpdate() {
      if (this.chartTimer) {
        clearInterval(this.chartTimer);
        this.chartTimer = null;
      }
    },
    cleanUpChart() {
      this.stopChartUpdate();
      this.destroyChartInstance();
    },
    updateChart() {
      // Проверяем, инициализирован ли график
      if (!this.chartInstance) return;

      const bots = this.meshbotStore.bots;
      const activeBotName = this.meshbotStore.activeBotName;
      if (!bots) return;
      const settings = bots.filter(i => i.name === activeBotName)[0].settings;
      if (!settings) return;

      const rawPriceData = toRaw(settings.priceData);
      const rawLines = toRaw(settings.linesData);

      const buyPrices = settings.buyLevels.map(level => level.price);
      const sellPrices = settings.profitLevels.map(order => order.price);

      // Применяем фильтр в зависимости от режима
      let filteredPriceData;
      if (this.meshbotStore.displayMode === "latest") {
        filteredPriceData = rawPriceData.slice(-this.meshbotStore.latestWindowSize);
      } else {
        filteredPriceData = rawPriceData;
      }

      this.chartInstance.data.datasets[0].data = filteredPriceData; //.slice();

      // Устанавливаем границы оси X
      const xMin = filteredPriceData.length > 0 ? filteredPriceData[0].x : 0;
      const xMax = filteredPriceData.length > 0 ? filteredPriceData[filteredPriceData.length - 1].x : 0;
      this.chartInstance.options.scales.x.min = xMin;
      this.chartInstance.options.scales.x.max = xMax;

      const visibleYValues = [
        ...filteredPriceData.map(p => p.y),
        ...rawLines.map(line => line.price),
        ...buyPrices,
        ...sellPrices,
      ].filter(value => value !== undefined);

      // Расчёт минимального и максимального значения Y
      const yMin = Math.min(...visibleYValues) - 1; // Padding в 1 пункт
      const yMax = Math.max(...visibleYValues) + 1;
      this.chartInstance.options.scales.y.min = yMin;
      this.chartInstance.options.scales.y.max = yMax;

      const verticalTrades = [];

      // Отображение линий с разными цветами
      const linesPoints = [];
      for (const line of rawLines) {
        linesPoints.push({x: 0, y: line.price, customColor: line.color});
        linesPoints.push({x: settings.timeIndex + 5, y: line.price, customColor: line.color});
        linesPoints.push({x: null, y: null});
      }
      // Добавляем линию текущей цены
      linesPoints.push({x: 0, y: settings.currentPrice, customColor: "white"});
      linesPoints.push({x: settings.timeIndex + 5, y: settings.currentPrice, customColor: "white"});
      linesPoints.push({x: null, y: null});

      this.chartInstance.data.datasets[1].data = linesPoints;
      // Привязываем цвет каждой линии к её значению
      this.chartInstance.data.datasets[1].segment = {
        borderColor: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customColor || "rgba(146,30,255,0.7)";
        },
      };

      // Пробегаемся по buyPoints
      for (const bp of toRaw(settings.buyPoints)) {
        verticalTrades.push({x: bp.x, y: yMin, customColor: "rgba(255,183,77,0.7)"});
        verticalTrades.push({x: bp.x, y: yMax, customColor: "rgba(255,183,77,0.7)"});
        verticalTrades.push({x: null, y: null});
      }
      // Пробегаемся по sellPoints
      for (const sp of toRaw(settings.sellPoints)) {
        verticalTrades.push({x: sp.x, y: yMin, customColor: "#9B67DB"});
        verticalTrades.push({x: sp.x, y: yMax, customColor: "#9B67DB"});
        verticalTrades.push({x: null, y: null});
      }

      this.chartInstance.data.datasets[4].data = verticalTrades;
      this.chartInstance.data.datasets[4].segment = {
        borderColor: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customColor || "gray";
        },
        borderDash: ctx => {
          const lineData = ctx.p1.raw;
          return lineData?.customDash || [0];
        },
      };

      // Обновляем график
      this.chartInstance.update();
    },
  },
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>