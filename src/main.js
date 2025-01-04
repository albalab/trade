import '@/assets/scss/main.css'

import '@/assets/scss/fonts/fontawesome/css/fontawesome.css'
// import '@/assets/scss/fonts/fontawesome/css/sharp-light.css'
//import '@/assets/scss/fonts/fontawesome/css/light.css'
import '@/assets/scss/fonts/fontawesome/css/thin.css'
import '@/assets/scss/fonts/fontawesome/css/solid.css'

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