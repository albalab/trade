<template>
  <div>
    <h3>Levels Renderer</h3>
    <!-- Выбор тикера -->

    <div>
      <label for="ticker">Selected Ticker:</label>
      <input
          type="text"
          id="ticker"
          v-model="selectedTicker"
      />
    </div>

    <!-- Отображение статистики по выбранному тикеру -->
    <div v-if="levelsStats[selectedTicker]">
      <div
          v-for="(item, index) in levelsStats[selectedTicker]"
          :key="index"
          style="padding: 5px; border: solid 1px #ccc; margin: 0 0 5px;"
      >
        <div v-if="showLevel(item, index)">
          <div style="background: #eee; position: relative; height: 4px; width: 100%;">
            <div style="background: blue; height: 100%;" :style="{width: `${100*(item.counterLevel/getLevelValue(index,500))}%`}"></div>
          </div>


          Level {{ index }}: Average: {{ item.sum / item.counterLevel || 0 }}<br />
          Level Count: {{ item.counterLevel }}<br />
          Level Sum: {{ item.sum }}
        </div>
      </div>
    </div>

    <!-- Отображение статистики по выбранному тикеру -->
<!--    <div v-if="tickerData[selectedTicker]">
      <div
          v-for="(item, index) in tickerData[selectedTicker]"
          :key="index"
          style="padding: 5px; border: solid 1px #ccc; margin: 0 0 5px;"
      >
        <div v-if="showLevel(item, index)">
          Level {{ index }}: Average: {{ item.sum / item.counterLevel || 0 }}<br />
          Total Count: {{ item.counterLevel }}<br />
          Total Sum: {{ item.sum }}
        </div>
      </div>
    </div>-->

  </div>
</template>

<script>
export default {
  name: "LevelsRenderer",
  props: {
    type: String,
    levelsStats: Object,
    items: Array,
  },
  data() {
    return {
      tickerData: {},

      selectedTicker: "SBER",

      thresholds: [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000], // Пороговые значения
    };
  },

  computed: {

  },

  methods: {

    getLevelValue(index, start) {
      return start * Math.pow(2, index);
    },

    getGeometricLevel(i, start) {
      if (i < start) return 0;
      return Math.floor(Math.log(i / start) / Math.log(2)) + 1;
    },

    showLevel(item, index){
      const currentLevel = this.getGeometricLevel(item.counterLevel, 500);
      if( currentLevel === index) return true;
      if( index > 0 && currentLevel - 1 === index) return true;
    },

    /*aggregateStatistics(items) {
      items.forEach((item) => {
        if (item.type === "trade" && item.ticker !== "IMOEX2") {
          // Инициализация тикера, если его еще нет
          if (!this.tickerData[item.ticker]) {
            this.initializeTicker(item.ticker);
          }
          // Обновление уровней для тикера
          this.updateLevels(this.tickerData[item.ticker], this.thresholds, item.tickerFrequency);
        }
      });
    },
    initializeTicker(ticker) {
      this.tickerData[ticker] = this.thresholds.map(() => ({
        sum: 0,
        counterLevel: 0,
      }));
    },
    updateLevels(levels, thresholds, value) {
      for (let i = levels.length - 1; i >= 0; i--) {
        if (levels[i].counterLevel >= thresholds[i]) {
          if (i > 0) {
            levels[i] = { ...levels[i - 1] };
          } else {
            levels[i] = {
              sum: levels[i].sum / levels[i].counterLevel,
              counterLevel: 0,
            };
          }
        } else {
          levels[i].sum += parseFloat(value);
          levels[i].counterLevel++;
        }
      }
    },*/

  },

  watch: {
    /*items(newItems) {
      if (Array.isArray(newItems) && newItems.length > 0) {
        this.aggregateStatistics(newItems);
      }
    },*/
  },

  mounted () {

  }
};
</script>
