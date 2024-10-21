<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>

    <!-- Новый блок для отображения сообщений -->
    <div v-if="receivedMessage">
      <h3>Полученное сообщение:</h3>
      <p>{{ receivedMessage }}</p>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
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
  beforeDestroy() {
    // Удаляем слушатель при уничтожении компонента
    window.removeEventListener('message', this.handleMessage);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
