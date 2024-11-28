<template>
  <div>
    <h3>Statistic Renderer</h3>
    <p>
      Last render time: {{ lastRenderTime }} <br />
      Render view count: {{ renderCount }} <br />

      Chunk items length: {{ items.length }} <br />
      Items counter: {{ itemsCounter }} <br />
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
    type: String,
    items: Array,
  },
  data() {
    return {

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

    updateCounter(items) {
      this.itemsCounter = this.itemsCounter + items.length;
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
      if (Array.isArray(newItems) && newItems.length > 0) {
        this.updateRenderTime();
        this.updateCounter(newItems);
        this.updateTimeline();
      }
    },
  },

  mounted () {
    this.updateRenderTime();
  }
};
</script>
