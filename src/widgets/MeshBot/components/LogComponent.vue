<template>
  <div class="log-container">
    <div>
      Осталось лимиток для восстановления: {{ remainingRestoreCount }}
    </div>
    <div class="log-box" ref="logBox">
      <pre>{{ logText }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogComponent",
  props: {
    logText: {
      type: String,
      required: true,
    },
    remainingRestoreCount: {
      type: Number,
      required: true,
    },
  },
  watch: {
    logText() {
      this.scrollToBottom();
    },
  },
  methods: {
    scrollToBottom() {
      if (this.$refs.logBox) {
        this.$refs.logBox.scrollTop = this.$refs.logBox.scrollHeight;
      }
    },
  },
  mounted() {
    this.scrollToBottom();
  },
};
</script>

<style scoped>
.log-container {
  padding: 16px;
}
.log-box {
  max-height: 400px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 8px;
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
