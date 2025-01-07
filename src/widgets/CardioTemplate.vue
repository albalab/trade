<template>
  <div class="cardiogram-container">

    <div class="controls">
      <button @click="setStyle(1)" class="btn btn-second">Trail</button>
      <button @click="setStyle(2)" class="btn btn-second">Eraser</button>
      <button @click="setStyle(3)" class="btn btn-second">Fade Trail</button>

      <div class="inputs">
        <label>
          <input
              type="number"
              v-model.number="eraserDistance"
              style="width: 60px;"
          />
        </label>
        <label>
          <input
              type="number"
              v-model.number="eraserWidth"
              style="width: 60px;"
          />
        </label>
      </div>
    </div>

    <div class="canvas-container" :style="{ width: `${canvasWidth}px` }">
      <canvas
          ref="ecgCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          style="background: black"
      ></canvas>
      <div style="position: absolute; width: 100%; height: 100%; left: 0; top: 0; background: rgba(166,186,249,0.3)">
        <!--полупрозрачный слой поверх -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardioTemplate',

  props: {
    waveChunk: {
      type: Array,
      default: () => []
    },
    autoRepeat: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      canvasWidth: 180,
      canvasHeight: 100,
      pointSpacing: 10,
      amplitude: 50,
      baseline: 50,
      speed: 3,
      pointRadius: 1,
      trail: 'rgba(0, 0, 0, 0.15)',
      drawStyle: 1,
      eraserDistance: 4,
      eraserWidth: 4,
      fadeFactor: 0.1,
      animationId: null,
      waveIndex: 0,
      lastX: 0,
      lastY: 0,
      didInitialEraser: false,
      newDataAvailable: false,
      colorShift: 0,
    };
  },

  mounted() {
    this.ctx = this.$refs.ecgCanvas.getContext('2d');

    this.waveIndex = 0;    // уже не реактивное поле
    this.lastX = 0;
    this.lastY = 0;
    this.animate();
  },

  beforeUnmount() {
    cancelAnimationFrame(this.animationId);
  },

  watch: {
    waveChunk: {
      immediate: true,
      handler(newVal) {
        this.waveIndex = 0;
        this.didInitialEraser = false;
        this.newDataAvailable = true;
        if (newVal && newVal.length > 0) {
          this.lastX = 0;
          this.lastY = this.baseline - newVal[0] * this.amplitude;
        } else {
          this.lastX = 0;
          this.lastY = this.baseline;
        }
      }
    }
  },

  methods: {
    setStyle(n) {
      this.drawStyle = n;
    },

    resetWave() {
      this.waveIndex = 0;
      this.didInitialEraser = false;
      if (this.waveChunk.length > 0) {
        this.lastX = 0;
        this.lastY = this.baseline - this.waveChunk[0] * this.amplitude;
      } else {
        this.lastX = 0;
        this.lastY = this.baseline;
      }
    },

    eraseStrip(x1, x2) {
      if (x1 > x2) {
        this.eraseStrip(x1, this.canvasWidth);
        this.eraseStrip(0, x2);
        return;
      }
      const left = Math.max(0, x1);
      const right = Math.min(x2, this.canvasWidth);
      if (right > left) {
        this.ctx.beginPath();
        this.ctx.rect(left, 0, right - left, this.canvasHeight);
        this.ctx.fill();
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);

      if (this.drawStyle === 1) {
        this.ctx.fillStyle = this.trail;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      }

      if (this.waveChunk.length > 1) {
        this.waveIndex += this.speed / this.pointSpacing;
        if (this.waveIndex >= this.waveChunk.length - 1) {
          this.waveIndex = this.waveChunk.length - 1;
        }
      }

      const iFloor = Math.floor(this.waveIndex);
      const iFrac = this.waveIndex - iFloor;
      const iNext = (iFloor + 1) % this.waveChunk.length;
      const yCurrent = this.waveChunk[iFloor] || 0;
      const yNext = this.waveChunk[iNext] || 0;
      const yInterpolated = yCurrent + (yNext - yCurrent) * iFrac;

      const pointX = this.waveIndex * this.pointSpacing;
      const pointY = this.baseline - yInterpolated * this.amplitude;

      if (this.drawStyle === 2) {
        if (!this.didInitialEraser && this.waveIndex < 0.5) {
          this.ctx.save();
          this.ctx.globalCompositeOperation = 'destination-out';
          const initLeft = 0;
          const initRight = Math.min(this.eraserDistance + this.eraserWidth + 5, this.canvasWidth);
          this.eraseStrip(initLeft, initRight);
          this.ctx.restore();
          this.didInitialEraser = true;
        }

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        const eraserLeft = pointX + this.eraserDistance;
        const eraserRight = eraserLeft + this.eraserWidth;
        this.eraseStrip(eraserLeft, eraserRight);
        this.ctx.restore();
      }

      if (this.drawStyle === 3 && this.newDataAvailable) {
        // Накладываем слой затемнения один раз при поступлении нового потока данных
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.restore();
        this.newDataAvailable = false; // Сбрасываем флаг после применения эффекта
      }

      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(pointX, pointY);
      this.ctx.strokeStyle = '#7da4f5';
      this.ctx.lineWidth = this.pointRadius * 2;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(pointX, pointY, this.pointRadius, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#789eec';
      this.ctx.fill();

      this.lastX = pointX;
      this.lastY = pointY;

      if (
          this.drawStyle === 1 &&
          this.autoRepeat &&
          this.waveIndex >= this.waveChunk.length - 1
      ) {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.waveIndex = 0;
        this.lastX = 0;
        this.lastY = this.baseline - (this.waveChunk[0] || 0) * this.amplitude;
        return;
      }
    }
  }
};
</script>

<style scoped>
.cardiogram-container {
  position: relative;
  width: fit-content;
  height: fit-content;
}

.controls {
  margin-bottom: 8px;
}

.inputs {
  margin-top: 10px;
}

button {
  margin-right: 10px;
}

.canvas-container {
  position: relative;
  overflow: hidden;
  border: solid 1px #5c6071;
}

canvas {
  display: block;
  box-sizing: border-box;
}

.inputs label {
}
</style>
