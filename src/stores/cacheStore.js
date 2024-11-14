// stores/cacheStore.js
import { defineStore } from 'pinia';

export const useCacheStore = defineStore({
    id: 'cacheStore',
    state: () => ({
        totalCountTrades: 0,
        componentAValue: null,  // Значения для хранения
        componentBValue: null,
        otherData: {}
    }),
    persist: true // Включаем сохранение состояния в localStorage
});
