import { defineStore } from "pinia";

export const useBotsStore = defineStore("bots", {
    state: () => ({

        activeBotIndex: null,

        bots: [

        ],

    }),

    actions: {
        setActiveBotIndex(index) {
            this.activeBotIndex = index;
        },

        createBot(botData) {
            this.bots.push(botData);
            this.setActiveBotIndex(this.bots.length - 1);
        },

        deleteBot(index) {
            this.bots.splice(index, 1);
            if (this.activeBotIndex >= index) {
                this.activeBotIndex = Math.max(this.activeBotIndex - 1, 0);
            }
        }
    },

    persist: true,

});
