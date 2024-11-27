<template>
  <div>
    <h3>Statistic Aggregator</h3>
    Last render time: {{lastRenderTime}} {{_renderCount}}<br>

    itemsCounter: {{ itemsCounter }}<br>
    Chunk items length: {{ items.length }}<br>
    Avg per second: {{ avgPerSecond.toFixed(2) }}<br>
    Avg per minute: {{ avgPerMinute.toFixed(2) }}<br>
    Avg per hour: {{ avgPerHour.toFixed(2) }}<br>
    Avg length of items: {{ avgItemsLength.toFixed(2) }}<br>

    <div v-for="(item, i) in tickerData.TCSG" :key="item.id" style="padding: 5px; border: solid 1px #ccc; margin: 0 0 5px;">
      <div v-if="getGeometricLevel(item.counterLevel, 500) === i">
        TCSG {{item.sum/item.counterLevel}} LEVEL: {{getGeometricLevel(item.counterLevel, 500)}}
        <div v-for="(value, key) in item" :key="value.id">
          {{ key }}: {{value}}<br>
        </div>
      </div>
    </div>

<!--    <div v-for="item in tickerData.LKOH" :key="item.id" style="padding: 5px; border: solid 1px #ccc; margin: 0 0 5px;">
      LKOH {{item.sum/item.counterLevel}}
      <div v-for="(value, key) in item" :key="value.id">
        {{ key }}: {{value}}<br>
      </div>
    </div>-->

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
      lastRenderTime: null,

      leftRange: 1000,
      rightRange: 1000,

      currentTime: null,

      itemsCounter: 0,
      startTime: null,
      avgPerSecond: 0,
      avgPerMinute: 0,
      avgPerHour: 0,
      totalItemsLength: 0,
      updatesCount: 0,
      avgItemsLength: 0,
      timelineStart: null,
      timelineEnd: null,
      pointSpacing: 0,
      pointCycle: 10,

      buyManager: null,
      sellManager: null,

      accumulatedTickerStats: {

      },

      tickerData: {
        /*TCSG: [
          { sum: 0, counterLevel: 0 }, // Уровень 0
          { sum: 0, counterLevel: 0 }, // Уровень 1
          { sum: 0, counterLevel: 0 }, // Уровень 2
          { sum: 0, counterLevel: 0 }, // Уровень 2
        ],
        LKOH: [
          { sum: 0, counterLevel: 0 },
          { sum: 0, counterLevel: 0 },
          { sum: 0, counterLevel: 0 },
          { sum: 0, counterLevel: 0 },
        ],*/
        // Другие тикеры можно добавить сюда
      },
      thresholds: [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000], // Пороговые значения
    };
  },

  methods: {

    updateRenderTime() {
      // Обновляем время последнего рендера
      this.lastRenderTime = new Date().toLocaleString();
      this._renderCount++;
    },

    getGeometricLevel(i, start) {
      if (i < start) return 0;
      return Math.floor(Math.log(i / start) / Math.log(2)) + 1;
    },

    isInGeometricSeries(i, start) {
      return i >= start && (i % start === 0) && (Math.log(i / start) / Math.log(2)) % 1 === 0;
    },

    aggregateStatistics(items) {
      items.forEach((item) => {
        if (item.type === 'trade' && item.ticker !== 'IMOEX2') {
          // Если тикер еще не добавлен, инициализируем его
          if (!this.tickerData[item.ticker]) {
            this.initializeTicker(item.ticker);
          }

          //console.log(item);

          if(!item.tickerFrequency) return
          
          // Обновляем уровни для текущего тикера
          this.updateLevels(this.tickerData[item.ticker], this.thresholds, item.tickerFrequency);
        }
      });
    },
    initializeTicker(ticker) {
      // Инициализация нового тикера с пустыми уровнями
      this.tickerData[ticker] = this.thresholds.map(() => ({
        sum: 0,
        counterLevel: 0,
      }));
    },
    updateLevels(levels, thresholds, value) {
      for (let i = levels.length - 1; i >= 0; i--) {
        if (levels[i].counterLevel >= thresholds[i]) {
          if (i > 0) {
            // Копируем данные с предыдущего уровня
            levels[i] = { ...levels[i - 1] };
          } else {
            // Для уровня 0 усредняем и сбрасываем
            levels[i] = {
              sum: levels[i].sum / levels[i].counterLevel,
              counterLevel: 0,
            };
          }
        } else {
          // Обновляем текущий уровень
          levels[i].sum += parseFloat(value);
          levels[i].counterLevel++;
        }
      }
    },

    /*aggregateStatistics(items) {

      const TCSG = this.TCSG;

      items.forEach((item) => {
        if(item.type === 'trade' && item.ticker !== 'IMOEX2'){

          if(item.ticker === 'TCSG'){

            //const level0 = this.getGeometricLevel(TCSG[0].counterLevel, 500);
            //const level1 = this.getGeometricLevel(TCSG[1].counterLevel, 500);

            // последний в списке элемент не копирует свое значение при переполнении
            if (TCSG[2].counterLevel >= 4000) {
              TCSG[2] = {
                sum: TCSG[1].sum,
                counterLevel: TCSG[1].counterLevel
              };
            } else {
              TCSG[2].sum += parseFloat(item.price);
              TCSG[2].counterLevel++;
            }

            // Уровень 1
            if (TCSG[1].counterLevel >= 2000) {
              TCSG[1] = {
                sum: TCSG[0].sum,
                counterLevel: TCSG[0].counterLevel
              };
            } else {
              TCSG[1].sum += parseFloat(item.price);
              TCSG[1].counterLevel++;
            }

            // Уровень 0
            if (TCSG[0].counterLevel >= 1000) {
              TCSG[0] = {
                sum: TCSG[0].sum / TCSG[0].counterLevel,
                counterLevel: 0
              };
            } else {
              TCSG[0].sum += parseFloat(item.price);
              TCSG[0].counterLevel++;
            }



            //должна вестись работа сразу со всеми уровнями

          }

          //console.log(item.price);

          //if(items[0].side) console.log(items[0].side)

          //if(this.accumulatedTickerStats[])

          //else console.log(items[0])
        }
      });

    },*/

    updateAvgItemsLength() {
      if (this.updatesCount > 0) {
        this.avgItemsLength = this.totalItemsLength / this.updatesCount;
      }
    },

    updateAveragesByTime() {
      const currentTime = new Date();
      const elapsedTimeInSeconds = (currentTime - this.startTime) / 1000; // Время с начала в секундах

      if (elapsedTimeInSeconds > 0) {
        this.avgPerSecond = this.itemsCounter / elapsedTimeInSeconds; // Среднее в секунду
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
      const lastTime = new Date(items[items.length - 1].time).getTime();

      if (!lastTime) return;

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

    this._renderCount = 0;
    this.updateRenderTime();

    if (this.type === 'quotes') {
      this.leftRange = 60000;
      this.rightRange = 10000;
    }
    if (this.type === 'candles') {
      this.leftRange = 70000;
      this.rightRange = 70000;
      this.pointSpacing = 3;
    }
  },
  updated() {
    // Фиксируем время, когда компонент обновился
    this.updateRenderTime();
    this.renderCount++;
  },
  watch: {
    items(newItems) {
      if (Array.isArray(newItems) && newItems.length > 0) {

        this.aggregateStatistics(newItems);

        // Устанавливаем таймлайн
        this.updateTimeline(newItems);

        this.updateCurrentTime();

        // Увеличиваем общий счетчик сделок
        this.itemsCounter += newItems.length;

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

.timeline-current-time {
  position: absolute;
  height: 100%;
  width: 2px;
  background-color: red;
  opacity: 0.8;
  z-index: 10;
}
</style>
