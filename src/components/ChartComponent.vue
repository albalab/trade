<template>
  <div class="candles-chart-container">
    <div ref="candles-chart"
         class="chart-scroll-container"
         @scroll="updateScrollPosition"
         @mousedown="startDrag('scroll')"
         @mousemove="dragScroll($event)"
         @mouseup="stopDrag">

      <div class="chart-container" :style="[getContainerStyle(), centeredStyle]">
        <div class="candle" v-for="(candle) in candlesticks" :key="candle.time.seconds">

          {{candle.open}}<br>
          {{candle.close}}<br>
          {{candle.high}}<br>
          {{candle.low}}<br>

        </div>
      </div>
    </div>

    <div class="axis yaxis" @mousedown="startDrag('vertical')" @mousemove="dragging($event)" @mouseup="stopDrag"></div>
    <div class="axis xaxis" @mousedown="startDrag('horizontal')" @mousemove="dragging($event)" @mouseup="stopDrag"></div>
  </div>
</template>

<script>
export default {
  props: {
    candlesticks: {
      type: Array,
      required: true,
    }
  },
  computed: {
    maxVolume() {
      // Определяем максимальный объем для нормализации высоты столбиков
      return Math.max(...this.candlesticks.map(c => c.volume));
    },
    centeredStyle() {
      return this.hasVerticalScroll ? {} : { top: '50%', transform: 'translateY(-50%)' };
    }
  },
  methods: {
    candleCloseNorm(candleClose) {
      // Нормализация закрытия свечи
      const closeValues = this.candlesticks.map(c => c.close.units);
      const minClose = Math.min(...closeValues);
      const maxClose = Math.max(...closeValues);
      return (candleClose - minClose) / (maxClose - minClose);
    },
    updateScrollPosition() {
      // Обработка скролла
    },
    startDrag(direction) {
      this.isDragging = true;
      this.dragDirection = direction;
      const scrollContainer = this.$refs['candles-chart'];
      this.initialScrollX = scrollContainer.scrollLeft;
      this.initialScrollY = scrollContainer.scrollTop;
      this.startX = event.clientX;
      this.startY = event.clientY;
    },
    dragScroll(event) {
      if (!this.isDragging || this.dragDirection !== 'scroll') return;
      const scrollContainer = this.$refs['candles-chart'];
      const deltaX = this.startX - event.clientX;
      const deltaY = this.startY - event.clientY;
      scrollContainer.scrollLeft = this.initialScrollX + deltaX;
      scrollContainer.scrollTop = this.initialScrollY + deltaY;
    },
    dragging(event) {
      if (!this.isDragging) return;
      if (this.dragDirection === 'horizontal') {
        const newHeight = this.height - event.movementY * this.scaleCoefficient;
        this.height = Math.max(this.minScale, Math.min(this.maxScale, newHeight));
      }
      if (this.dragDirection === 'vertical') {
        const newWidth = this.width + event.movementX * this.scaleCoefficient;
        this.width = Math.max(this.minScale, Math.min(this.maxScale, newWidth));
      }
      this.checkVerticalScroll();
    },
    stopDrag() {
      this.isDragging = false;
      this.dragDirection = null;
    },
    getContainerStyle() {
      return {
        width: `${this.width}%`,
        height: `${this.height}%`,
      };
    },
    checkVerticalScroll() {
      const scrollContainer = this.$refs['candles-chart'];
      this.hasVerticalScroll = scrollContainer.scrollHeight > scrollContainer.clientHeight;
    }
  }
};
</script>

<style scoped>
.candles-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.chart-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: scroll;
}
.chart-container {
  position: relative;
  margin: auto;
  display: flex;
  background: #eee;
}
.candle {
  width: 100%;
}
.candle-body {
  width: 80%;
  height: 100%;
  position: relative;
  margin: 0 auto;
}
.candle-value {
  width: 100%;
  height: 20%;
  background: rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 40px;
}
.candle-value-fill {
  position: absolute;
  bottom: 0;
  background: blue;
  width: 90%;
  margin: 0 auto;
}
.axis {
  position: absolute;
}
.xaxis {
  top: 0;
  right: 0;
  width: 40px;
  height: 100%;
  background: green;
  opacity: 0.2;
}
.yaxis {
  bottom: 0;
  width: 100%;
  height: 40px;
  background: red;
  opacity: 0.2;
}
</style>
