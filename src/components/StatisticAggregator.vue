<template>
  <div>
    <h3>Statistic Aggregator</h3>
    counter: {{ counter }}<br>
    Chunk items length: {{ items.length }}<br>
    Avg per second: {{ avgPerSecond.toFixed(2) }}<br>
    Avg per minute: {{ avgPerMinute.toFixed(2) }}<br>
    Avg per hour: {{ avgPerHour.toFixed(2) }}<br>
    Avg length of items: {{ avgItemsLength.toFixed(2) }}<br>

    <div class="timeline">
      <div
          v-for="(item, index) in items"
          :key="index"
          class="timeline-point"
          :class="{
            'timeline-point-candle': this.type === 'candles'
          }"
          :style="{
            left: calculatePosition(item.time) + '%',
            top: calculateTopPosition(index) + 'px'
          }"
          title="Time: {{ item.time }}"
      >
      </div>

      <div
          v-if="currentTime"
          class="timeline-current-time"
          :style="{ left: calculatePosition(currentTime) + '%' }"
          title="Current time"
      ></div>
    </div>
  </div>
</template>

<script>

export default {
  name: "statistic-aggregator",

  props: {
    type: String,
    items: Array,
  },

  data() {
    return {
      leftRange: 1000,
      rightRange: 1000,

      currentTime: null,

      counter: 0, // Общий счетчик сделок
      startTime: null, // Время начала подсчета
      avgPerSecond: 0, // Средняя скорость в секунду
      avgPerMinute: 0, // Средняя скорость в минуту
      avgPerHour: 0, // Средняя скорость в час
      totalItemsLength: 0, // Сумма длин массивов items
      updatesCount: 0, // Количество обновлений items
      avgItemsLength: 0, // Средняя длина массива items
      timelineStart: null, // Начало таймлайна
      timelineEnd: null, // Конец таймлайна
      pointSpacing: 0, // Шаг между точками по вертикали
      pointCycle: 10, // Количество точек в одном цикле сверху вниз

      buyManager: null, // Менеджер диапазонов для `buy`
      sellManager: null, // Менеджер диапазонов для `sell`

      accumulatedTickerStats: {
        'GAZP': {
          '0-100': { filled: false, level: 100, sum: 0, levelCount: 0, },
          '100-200': { filled: false, level: 200, sum: 0, levelCount: 0, },
          '100-400': { filled: false, level: 400, sum: 0, levelCount: 0, },
        },
        'LKOH': {
          '0-100': { filled: false, level: 100, sum: 0, levelCount: 0, },
          '100-200': { filled: false, level: 200, sum: 0, levelCount: 0, },
          '100-400': { filled: false, level: 400, sum: 0, levelCount: 0, },
        },
        'SBER': {
          '0-100': { filled: false, level: 100, sum: 0, levelCount: 0, },
          '100-200': { filled: false, level: 200, sum: 0, levelCount: 0, },
          '100-400': { filled: false, level: 400, sum: 0, levelCount: 0, },
        },
      },


    };
  },

  methods: {

    rangeAccumulator() {

    },

    updateAvgItemsLength() {
      if (this.updatesCount > 0) {
        this.avgItemsLength = this.totalItemsLength / this.updatesCount;
      }
    },

    updateAveragesByTime() {
      const currentTime = new Date();
      const elapsedTimeInSeconds = (currentTime - this.startTime) / 1000; // Время с начала в секундах

      if (elapsedTimeInSeconds > 0) {
        this.avgPerSecond = this.counter / elapsedTimeInSeconds; // Среднее в секунду
        this.avgPerMinute = this.avgPerSecond * 60; // Среднее в минуту
        this.avgPerHour = this.avgPerSecond * 3600; // Среднее в час
      }
    },

    updateCurrentTime() {
      this.currentTime = new Date().toISOString();
    },

    updateTimeline(items) {
      //const firstTime = new Date(items[0].time).getTime();

      /*const currentTimestamp = Math.floor(Date.now() / 1000); // Текущее время в секундах
      const futureTimestamp = currentTimestamp + 1; // На секунду вперед
*/
      const lastTime =  new Date(items[items.length - 1].time).getTime();

      if(!lastTime) return;

      // Устанавливаем начало и конец таймлайна с отступом в 5 секунд
      this.timelineStart = new Date(lastTime - this.leftRange).toISOString();
      this.timelineEnd = new Date(lastTime + this.rightRange).toISOString();
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

    calculateTopPosition(index) {
      // Рассчитываем вертикальную позицию с шагом `pointSpacing` и циклом `pointCycle`
      return (index % this.pointCycle) * this.pointSpacing;
    },
  },

  mounted() {
    if(this.type === 'quotes'){
      this.leftRange = 60000;
      this.rightRange = 10000;
    }
    if(this.type === 'candles'){
      this.leftRange = 70000;
      this.rightRange = 70000;
      this.pointSpacing = 3;
    }
  },

  watch: {
    items(newItems) {
      if (Array.isArray(newItems) && newItems.length > 0) {
        // Устанавливаем таймлайн
        this.updateTimeline(newItems);

        this.updateCurrentTime();

        if (this.startTime === null) {
          this.startTime = new Date(); // Фиксируем начало времени, если еще не зафиксировано
        }

        // Увеличиваем общий счетчик сделок
        this.counter += newItems.length;

        // Увеличиваем общую сумму длины массивов
        this.totalItemsLength += newItems.length;

        // Увеличиваем количество обновлений
        this.updatesCount++;

        // Пересчитываем среднюю длину массива items
        this.updateAvgItemsLength();

        // Пересчитываем средние значения по времени
        this.updateAveragesByTime();


        newItems.forEach(() => {


          //console.log(item);

        });

      }
    },
  },

};
</script>

<style>
.table{
  display: table;
  width: 100%;
}
.table-row{
  display: table-row;
}
.table-cell{
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
.timeline-point-candle{
  width: 2px;
  height: 2px;
}
.timeline-current-time {
  position: absolute;
  height: 100%;
  width: 2px;
  background-color: red;
  opacity: 0.8;
  z-index: 10;
}
</style>
