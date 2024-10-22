import { createApp } from 'vue';
import App from './App.vue';
import router from './routes'; // Импортируем роутер
import { createHead } from '@vueuse/head'; // Импортируем head из vueuse

// Создаем экземпляр head
const head = createHead();

// Создаем приложение Vue и подключаем роутер и head
const app = createApp(App);
app.use(router);
app.use(head);
app.mount('#app');
