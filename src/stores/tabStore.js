import { defineStore } from 'pinia';

export const useTabStore = defineStore('tabStore', {
    state: () => ({
        tabs: [

        ],
        bots: [],
    }),
    persist: true, // Включает сохранение в localStorage
});
