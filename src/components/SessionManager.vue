<template>
  <div>
    <button @click="resetSession">Начать новую сессию</button>
  </div>
</template>

<script>
export default {
  name: "SessionManager",
  data() {
    return {
      sessionKey: null,
    };
  },
  methods: {
    generateSessionKey() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    loadSessionKey() {
      // Загружаем ключ сессии из localStorage или создаем новый
      this.sessionKey = localStorage.getItem("sessionKey") || this.generateSessionKey();
      localStorage.setItem("sessionKey", this.sessionKey);

      // Генерируем событие с ключом сессии
      this.$emit("session-updated", this.sessionKey);
    },
    resetSession() {
      // Удаляем ключ сессии и создаем новый
      localStorage.removeItem("sessionKey");
      this.loadSessionKey();
    },
  },
  mounted() {
    this.loadSessionKey();
  },
};
</script>
