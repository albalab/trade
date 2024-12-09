<template>
  <div class="stats-diagram">
    <div style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        <h3>All</h3>
        <div class="info">
          Items:  {{ Object.keys(totalItemsStats).length }}
        </div>
        <div class="stats-diagram">
          <div v-for="(count, ticker) in totalItemsStats" :key="ticker" class="row">
            <div class="cell">
              <div class="ticker-info">
                <span class="ticker" @click="$emit('select-ticker', ticker)">{{ ticker }}</span> {{ count }}
              </div>
              <div class="progress-bar-container">
                <div
                    class="progress-bar"
                    :style="{ width: `${(count / Math.max(...Object.values(totalItemsStats))) * 100}%` }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3>Stream</h3>
        <div class="info">
          Items:   {{ Object.keys(streamItemsStats).length }}
        </div>
        <div class="stats-diagram">
          <div v-for="(count, ticker) in streamItemsStats" :key="ticker" class="row">
            <div class="cell" :class="{ 'highlighted': isHighlighted(ticker) }">
              <div class="ticker-info">
                <span class="ticker" @click="$emit('select-ticker', ticker)">{{ ticker }}</span> {{ count }}
              </div>
              <div class="progress-bar-container">
                <div
                    class="progress-bar"
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
    isHighlighted(ticker) {
      const streamRank = this.top10streamItemsStats.indexOf(ticker);
      const totalRank = this.sortedtotalItemsStats.indexOf(ticker);

      // Подсветить, если тикер из топ-10 `streamItemsStats` поднялся выше
      return streamRank !== -1 && (totalRank === -1 || streamRank < totalRank);
    }
  }
};
</script>

<style scoped>
.stats-diagram{
  overflow: hidden;
  height: 350px;
}
.progress-bar-container {
  background: #f0f0f0;
  height: 4px;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  background: #007bff;
  height: 100%;
}

.ticker-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.highlighted {
  color: #ff0bf7;
}
.info{
  margin: 0 0 10px;
}
</style>
