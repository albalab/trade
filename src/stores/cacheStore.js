// stores/cacheStore.js
import { defineStore } from 'pinia';

export const useCacheStore = defineStore({
    id: 'cacheStore',
    state: () => ({
        cachedData: {}  // Объект, который нужно сохранять
    }),
    persist: true  // Включаем автоматическое сохранение состояния в localStorage
});
