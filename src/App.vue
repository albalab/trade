<template>
  <div id="app" class="ttrade-app">

<!--    <div v-if="receivedMessage">
      <p>{{ receivedMessage }}</p>
    </div>-->

    <router-view />

  </div>
</template>

<script>

export default {
  name: 'App',
  components: {

  },
  data() {
    return {
      receivedMessage: null, // Храним полученное сообщение
    };
  },
  methods: {
    // Метод для обработки входящих сообщений от iframe
    handleMessage(event) {
      // Проверим источник сообщения, чтобы убедиться, что это наш iframe
      // Можете добавить проверку event.origin для безопасности
      if (event.data && typeof event.data === 'object') {
        // Обновляем состояние, чтобы показать сообщение в интерфейсе
        this.receivedMessage = `Время: ${event.data.time}, Данные: ${event.data.data}`;
      }
    }
  },
  mounted() {
    // Добавляем слушатель на событие message
    window.addEventListener('message', this.handleMessage);
  },
  beforeUnmount() {
    // Удаляем слушатель при уничтожении компонента
    window.removeEventListener('message', this.handleMessage);
  }
}
</script>
