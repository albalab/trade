import { createApp } from 'vue';
import App from './App.vue';
import router from './routes';
import { createHead } from '@vueuse/head';

import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';

const head = createHead();
const pinia = createPinia();

// Подключаем плагин к Pinia
pinia.use(piniaPersistedState);

const app = createApp(App);

app.use(router);
app.use(head);

// Подключаем Pinia к приложению
app.use(pinia);

app.mount('#app');