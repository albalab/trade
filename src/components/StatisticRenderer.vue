<template>
  <div>

    <p>
      Last render time: {{ lastRenderTime }} <br />
      Render view count: {{ renderCount }} <br />

      Chunk items length: {{ items.length }} <br />
    </p>


    <!-- Таймлайн -->
    <div class="timeline">
      <div
          v-for="(item, index) in items"
          :key="index"
          class="timeline-point"
          :class="{ 'timeline-point-candle': type === 'candles' }"
          :style="{
          left: calculatePosition(item.time) + '%',
          top: calculateTopPosition(index) + 'px'
        }"
      ></div>
      <div
          class="timeline-current-time"
          :style="{ left: calculatePosition(new Date().getTime()) + '%' }"
      ></div>
      <div
          v-if="items.length"
          class="timeline-server-time"
          :style="{ left: calculatePosition(lastServerTime) + '%' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatisticRenderer",
  props: {
    items: Array,
  },
  data() {
    return {

      type: null,

      itemsCounter: 0, // Счётчик элементов
      renderCount: 0, // Счётчик рендеров
      lastRenderTime: null, // Время последнего рендера

      timelineStart: 0, // Начало таймлайна
      timelineEnd: 0, // Конец таймлайна
    };
  },

  computed: {
    lastServerTime() {
      return new Date(this.items[this.items.length - 1]?.serverTime).getTime();
    }
  },

  methods: {

    updateTimeline() {
      const lastItemTime = this.items.length > 0 ? new Date(this.items[this.items.length - 1].time).getTime() : null;
      if (lastItemTime) {
        this.timelineStart = lastItemTime - 1000; // Начало таймлайна
        this.timelineEnd = lastItemTime + 1000; // Конец таймлайна
      }
    },

    updateRenderTime() {
      this.lastRenderTime = new Date().toLocaleString(); // Обновляем время
      this.renderCount++; // Увеличиваем счётчик рендеров
    },

    calculatePosition(time) {
      const itemTime = new Date(time).getTime();
      const start = new Date(this.timelineStart).getTime();
      const end = new Date(this.timelineEnd).getTime();

      // Если время сделки вне диапазона, возвращаем крайние значения
      if (itemTime < start) return 0;
      if (itemTime > end) return 100;

      // Рассчитываем позицию как процент от общего диапазона
      return ((itemTime - start) / (end - start)) * 100;
    },

    calculateTopPosition() {
      return 0; // Устанавливаем все точки на одной высоте
    },
  },

  //this.updateRenderTime(); // Обновляем время рендера
  watch: {
    items(newItems) {
      if(newItems.length) this.type = newItems[newItems.length - 1].type;
      if (Array.isArray(newItems) && newItems.length > 0) {
        this.updateRenderTime();
        this.updateTimeline();
      }
    },
  },

  mounted () {
    this.updateRenderTime();
  }
};
</script>

<style>
.table {
  display: table;
  width: 100%;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  padding: 0 2px;
}

.timeline {
  position: relative;
  width: 100%;
  height: 30px; /* Увеличиваем высоту для размещения точек */
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  margin-top: 20px;
}


.timeline-point {
  position: absolute;
  height: 100%;
  width: 1px;
  background-color: #007bff;
  opacity: 0.6;
}

.timeline-point-candle {
  width: 2px;
  height: 2px;
}

.timeline-server-time,
.timeline-current-time {
  position: absolute;
  height: 100%;
  width: 2px;
  background-color: green;
  opacity: 0.8;
  z-index: 10;
}
.timeline-server-time{
  background-color: red;
}
</style>
