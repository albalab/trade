<template>
  <div class="bots-selector">
    <div class="context-selector">
      <span class="name">Контекст:</span>
      <select v-model="localMarket" @change="updateMarket">
        <option v-for="market in markets" :key="market" :value="market">
          {{ market }}
        </option>
      </select>
      <select v-model="localBoard" @change="updateBoard">
        <option v-for="board in boards" :key="board" :value="board">
          {{ board }}
        </option>
      </select>
      <select v-model="localTicker" @change="updateTicker">
        <option v-for="ticker in tickers" :key="ticker" :value="ticker">
          {{ ticker }}
        </option>
      </select>
    </div>
    <div class="dropdown-selector">
      <span class="name">Параметры:</span>
      <select v-model="localSelected" @change="updateSelection">
        <option v-for="(item, index) in items" :key="item.name" :value="index">
          {{ item.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Для первой части
    markets: Array,
    boards: Array,
    tickers: Array,
    selectedMarket: String,
    selectedBoard: String,
    selectedTicker: String,
    // Для второй части
    items: Array,
    selectedFromDropdown: Number,
  },
  data() {
    return {
      // Локальные данные для первой части
      localMarket: this.selectedMarket,
      localBoard: this.selectedBoard,
      localTicker: this.selectedTicker,
      // Локальные данные для второй части
      localSelected: this.selectedFromDropdown,
    };
  },
  watch: {
    // Синхронизация данных при обновлении props
    selectedMarket(newValue) {
      this.localMarket = newValue;
    },
    selectedBoard(newValue) {
      this.localBoard = newValue;
    },
    selectedTicker(newValue) {
      this.localTicker = newValue;
    },
    selectedFromDropdown(newValue) {
      this.localSelected = newValue;
    },
  },
  methods: {
    // Методы для первой части
    updateMarket() {
      this.$emit("update:selectedMarket", this.localMarket);
    },
    updateBoard() {
      this.$emit("update:selectedBoard", this.localBoard);
    },
    updateTicker() {
      this.$emit("update:selectedTicker", this.localTicker);
    },
    // Методы для второй части
    updateSelection() {
      this.$emit("update:selectedFromDropdown", this.localSelected);
    },
  },
};
</script>

<style scoped>
.bots-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.context-selector,
.dropdown-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
