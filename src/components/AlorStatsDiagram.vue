<template>
  <div style="overflow: hidden; height: 350px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        <h3>Total counts</h3>
        <div class="stats-diagram">
          <div v-for="(count, ticker) in totalCounts" :key="ticker" class="row">
            <div class="cell">
              <div class="ticker-info">
                <span class="ticker" @click="$emit('select-ticker', ticker)">{{ ticker }}</span> {{ count }}
              </div>
              <div class="progress-bar-container">
                <div
                    class="progress-bar"
                    :style="{ width: `${(count / Math.max(...Object.values(totalCounts))) * 100}%` }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3>Stream objects {{ Object.keys(streamObjects).length }}</h3>
        <div class="stats-diagram">
          <div v-for="(count, ticker) in streamObjects" :key="ticker" class="row">
            <div class="cell" :class="{ 'highlighted': isHighlighted(ticker) }">
              <div class="ticker-info">
                <span class="ticker" @click="$emit('select-ticker', ticker)">{{ ticker }}</span> {{ count }}
              </div>
              <div class="progress-bar-container">
                <div
                    class="progress-bar"
                    :style="{ width: `${(count / Math.max(...Object.values(streamObjects))) * 100}%` }">
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
    totalCounts: {
      type: Object,
      required: true,
      default: () => ({})
    },
    streamObjects: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    sortedTotalCounts() {
      return Object.entries(this.totalCounts).sort(([, a], [, b]) => b - a).map(([ticker]) => ticker);
    },
    sortedStreamObjects() {
      return Object.entries(this.streamObjects).sort(([, a], [, b]) => b - a).map(([ticker]) => ticker);
    },
    top10StreamObjects() {
      return this.sortedStreamObjects.slice(0, 10);
    }
  },
  methods: {
    isHighlighted(ticker) {
      const streamRank = this.top10StreamObjects.indexOf(ticker);
      const totalRank = this.sortedTotalCounts.indexOf(ticker);

      // Подсветить, если тикер из топ-10 `streamObjects` поднялся выше
      return streamRank !== -1 && (totalRank === -1 || streamRank < totalRank);
    }
  }
};
</script>

<style scoped>

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
</style>
