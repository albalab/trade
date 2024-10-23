<template>
  <div class="outer-container">
    <div class="candles-chart-container">
      <div ref="candles-chart"
           class="chart-scroll-container"
           @scroll="updateScrollPosition"
           @mousedown="startDrag('scroll')"
           @mousemove="dragScroll($event)"
           @mouseup="stopDrag">

        <div class="chart-container" :style="[getContainerStyle(), centeredStyle]">
          <div class="candle" v-for="(item, index) in candlesticks" :key="item.id">
            {{ candlesticks[index] }}
            {{ item[4] }}

            <div class="candle-body"
                 v-if="index > 1 && candleCloseNorm(candlesticks[index]) !== candleCloseNorm(candlesticks[index-1])"
                 :style="{ bottom: `${(candleCloseNorm(item[4]) * 100)}%`, position: 'relative' }">
              <div class="candle-value">
                <div class="candle-value-fill"
                     :style="{height: `${(item[5]/candleVolumeMax[`t${item[0]}`])*100}%`}"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="axis yaxis" @mousedown="startDrag('vertical')" @mousemove="dragging($event)" @mouseup="stopDrag"></div>
      <div class="axis xaxis" @mousedown="startDrag('horizontal')" @mousemove="dragging($event)" @mouseup="stopDrag"></div>

    </div>
  </div>
</template>

<script>
export default {
  name: "test-view",
  data() {
    return {
      candlesticks: [],
      candleVolumeMax: {},
      socket: null,
      reconnectInterval: 5000,
      connectionStatus: 'disconnected',
      figi: 'BBG004731032',
      scrollX: 0,
      scrollY: 0,
      shiftPressed: false,
      scaleCoefficient: 0.8,
      width: 100,
      height: 100,
      minScale: 10,
      maxScale: 600,
      isDragging: false,
      dragDirection: null,
      hasVerticalScroll: false,
      initialScrollX: 0,
      initialScrollY: 0,
      startX: 0,
      startY: 0,
      maxCandlesticks: 50,
      candleCloseMax: null,
      candleCloseMin: null,
      candleTime: null,
    };
  },
  computed: {
    centeredStyle() {
      // Если вертикального скролла нет, центрируем график
      return this.hasVerticalScroll ? {} : { top: '50%', transform: 'translateY(-50%)' };
    }
  },
  mounted() {
    this.openSocket();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.checkVerticalScroll();
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.closeSocket();
  },
  methods: {
    openSocket() {
      this.connectionStatus = 'connecting';
      this.socket = new WebSocket("wss://invest-public-api.tinkoff.ru/ws/tinkoff.public.invest.api.contract.v1.MarketDataStreamService/MarketDataStream", ["json-proto", "t.N_Duppj6e3FojW1CTf0KMm8vaRCQer5e4iLFWuIoWPsEg39PLzFAr0-6113CGru5Qk_zkVXVs9Gxs7zGxgn-uw"]);

      this.socket.onopen = () => {
        this.connectionStatus = 'connected';
        this.socket.send(JSON.stringify({
          "subscribeCandlesRequest": {
            "subscriptionAction": "SUBSCRIPTION_ACTION_SUBSCRIBE",
            "instruments": [{ "figi": this.figi, "interval": 1 }]
          }
        }));
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.candle) {
          this.handleCandlestick(data.candle);
        }
      };

      this.socket.onclose = () => {
        this.connectionStatus = 'disconnected';
        setTimeout(this.openSocket, this.reconnectInterval);
      };

      this.socket.onerror = () => {
        this.connectionStatus = 'error';
      };
    },
    closeSocket() {
      if (this.socket) {
        this.socket.close();
      }
    },
    handleCandlestick(candlestick) {
      const candleArray = this.convertObjectToArray(candlestick);
      const t = candleArray[0];
      this.candleVolumeMax[`t${t}`] = candleArray[5];

      if (!this.candleCloseMax) this.candleCloseMax = candleArray[4];
      if (!this.candleCloseMin) this.candleCloseMin = candleArray[4];

      if (candleArray[4] > this.candleCloseMax) this.candleCloseMax = candleArray[4];
      if (candleArray[4] < this.candleCloseMin) this.candleCloseMin = candleArray[4];

      this.candleTime = t;
      this.candlesticks.push(candleArray);

      if (this.candlesticks.length > this.maxCandlesticks) {
        this.candlesticks.shift();
      }
    },
    convertObjectToArray(candleObject) {
      const { open, high, low, close, volume, time } = candleObject;
      return [
        time.seconds * 1000 + Math.floor(time.nanos / 1e6),
        open.units + open.nano / 1e9,
        high.units + high.nano / 1e9,
        low.units + low.nano / 1e9,
        close.units + close.nano / 1e9,
        volume
      ];
    },
    candleCloseNorm(candleClose) {
      return (candleClose - this.candleCloseMin) / (this.candleCloseMax - this.candleCloseMin);
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
    handleKeyDown(event) {
      if (event.key === 'Shift') this.shiftPressed = true;
    },
    handleKeyUp(event) {
      if (event.key === 'Shift') this.shiftPressed = false;
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
.outer-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
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
