<template>
  <div class="stats-diagram">
    <div style="display: grid; grid-template-columns: 1fr 1fr;">

      <div>
<!--        <h3>All</h3>
        <div class="info">
          Items:  {{ Object.keys(totalItemsStats).length }}
        </div>-->
        <div class="stats-diagram">
          <div v-for="(count, ticker) in totalItemsStats" :key="ticker" class="row">
            <div class="cell" style="display: grid; grid-template-columns: 2fr 2fr 3fr;">
              <div class="ticker"
                   @click="$emit('select-ticker', ticker)">{{ ticker }}</div>
              <div class="ticker-info">
                {{ count }}
              </div>
              <div class="progress-bar-container">
                <div
                    class="progress-bar-fill"
                    :style="{ width: `${(count / Math.max(...Object.values(totalItemsStats))) * 100}%` }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
<!--        <h3>Stream</h3>
        <div class="info">
          Items:   {{ Object.keys(streamItemsStats).length }}
        </div>-->
        <div class="stats-diagram">
          <div v-for="(count, ticker) in streamItemsStats" :key="ticker" class="row">
            <div class="cell" style="display: grid; grid-template-columns: 2fr 1fr 3fr;">
              <div class="ticker"
                   @click="$emit('select-ticker', ticker)">{{ ticker }}</div>
              <div class="ticker-info">
                 {{ count }}
              </div>
              <div class="progress-bar-container">
                <div
                    class="progress-bar-fill"
                    :style="{ width: `${(count / Math.max(...Object.values(streamItemsStats))) * 100}%` }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AlorStatsDiagram',
  props: {
    totalItemsStats: {
      type: Object,
      required: true,
      default: () => ({})
    },
    streamItemsStats: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    sortedtotalItemsStats() {
      return Object.entries(this.totalItemsStats).sort(([, a], [, b]) => b - a).map(([ticker]) => ticker);
    },
    sortedstreamItemsStats() {
      return Object.entries(this.streamItemsStats).sort(([, a], [, b]) => b - a).map(([ticker]) => ticker);
    },
    top10streamItemsStats() {
      return this.sortedstreamItemsStats.slice(0, 10);
    }
  },
  methods: {
    /*isHighlighted(ticker) {
      //const streamRank = this.top10streamItemsStats.indexOf(ticker);
      //const totalRank = this.sortedtotalItemsStats.indexOf(ticker);

      // Подсветить, если тикер из топ-10 `streamItemsStats` поднялся выше
      //return streamRank !== -1 && (totalRank === -1 || streamRank < totalRank);
    }*/
  }
};
</script>
