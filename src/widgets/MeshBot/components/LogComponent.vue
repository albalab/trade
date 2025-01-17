<template>
  <div class="log">
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
