<template>
  <div>
    <canvas ref="timerCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script>
export default {
  name: "TimerGraph",

  props: {
    externalMetric: {
      type: Number,
      default: null,
      validator: (value) => value >= 0 && value <= 1,
    },
    isAccumulating: {
      type: Boolean,
      default: false, // Включает режим накопления
    },
  },

  data() {
    return {
      data: [], // Данные таймеров
      timers: [3, 5,  7, 11, 13], // Интервалы таймеров в секундах
      displayInterval: 30000, // Интервал отображения данных (в миллисекундах)
      colors: [
        "rgba(255, 69, 0, 0.7)",   // Красный-оранжевый (горячий)
        "rgba(255, 165, 0, 0.7)", // Оранжевый
        "rgba(255, 223, 0, 0.7)", // Желтый
        "rgba(0, 128, 255, 0.7)", // Голубой
        "rgba(75, 0, 130, 0.7)"   // Индиго (холодный)
      ], // Цвета для таймеров
      margin: 5, // Отступы для графика
      canvasWidth: 240,
      canvasHeight: 120,
      ctx: null,
    };
  },

  methods: {
    findIntersections() {
      const grouped = this.data.reduce((acc, d) => {
        acc[d.timestamp] = acc[d.timestamp] || [];
        acc[d.timestamp].push(d.timer);
        return acc;
      }, {});

      return Object.keys(grouped)
          .filter((timestamp) => grouped[timestamp].length > 1)
          .map(Number);
    },

    drawVerticalLines(intersections, minTime, maxTime) {
      const ctx = this.ctx;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;

      intersections.forEach((timestamp) => {
        const x = this.timeToX(timestamp, minTime, maxTime);
        ctx.beginPath();
        ctx.moveTo(x, this.margin);
        ctx.lineTo(x, this.canvasHeight - this.margin);
        ctx.stroke();
      });
    },

    timeToX(timestamp, minTime, maxTime) {
      const graphWidth = this.canvasWidth - 2 * this.margin;
      return (
          this.margin +
          ((timestamp - minTime) / (maxTime - minTime)) * graphWidth
      );
    },

    metricToY(metric, minMetric, maxMetric) {
      const graphHeight = this.canvasHeight - 2 * this.margin;
      return (
          this.margin +
          graphHeight -
          ((metric - minMetric) / (maxMetric - minMetric)) * graphHeight
      );
    },

    generateData(timer) {
      const now = Date.now();
      const metric =
          this.externalMetric !== null ? this.externalMetric : Math.random();

      this.data.push({timer, timestamp: now, metric});

      if (!this.isAccumulating) {
        const cutoffTime = now - this.displayInterval;
        while (this.data.length > 0 && this.data[0].timestamp < cutoffTime) {
          this.data.shift();
        }
      }
    },

    drawGraph() {
      const ctx = this.ctx;
      const width = this.canvasWidth;
      const height = this.canvasHeight;
      const margin = this.margin;
      const graphHeight = height - 2 * margin;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "#666";
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const y = margin + (i / 10) * graphHeight;
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
      }
      ctx.stroke();

      const minTime = this.isAccumulating
          ? Math.min(...this.data.map((d) => d.timestamp))
          : Date.now() - this.displayInterval;
      const maxTime = Date.now();
      const minMetric = 0;
      const maxMetric = 1;

      const intersections = this.findIntersections();
      this.drawVerticalLines(intersections, minTime, maxTime);

      this.timers.forEach((timer, index) => {
        const timerData = this.data.filter((d) => d.timer === timer);

        ctx.strokeStyle = this.colors[index % this.colors.length];
        ctx.lineWidth = 1;
        ctx.beginPath();
        timerData.forEach((d, i) => {
          const x = this.timeToX(d.timestamp, minTime, maxTime);
          const y = this.metricToY(d.metric, minMetric, maxMetric);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        ctx.fillStyle = this.colors[index % this.colors.length];
        timerData.forEach((d) => {
          const x = this.timeToX(d.timestamp, minTime, maxTime);
          const y = this.metricToY(d.metric, minMetric, maxMetric);

          /*ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();*/


          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2); // Рисуем круг
          ctx.lineWidth = 1; // Толщина линии
          ctx.stroke(); // Рисуем контур круга
        });
      });
    },
  },

  mounted() {
    const canvas = this.$refs.timerCanvas;
    this.ctx = canvas.getContext("2d");

    this.timers.forEach((timer) => {
      setInterval(() => this.generateData(timer), timer * 1000);
    });

    setInterval(this.drawGraph, 100);
  },
};
</script>

<style scoped>
canvas {
  display: block;
  margin: 0 auto;
}
</style>
