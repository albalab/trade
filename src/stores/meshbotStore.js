import { defineStore } from "pinia";
//import { useOrdersStore } from '@/stores/ordersStore';

export const useMeshbotStore = defineStore("meshbot", {
    state: () => ({

        activeBotIndex: null,


        bots: [

        ],

        visibilityState: {
            block0: true,
            block1: true,
            block2: true,
            block3: true,
            block4: true,
            block5: true,
            block6: true,
            block7: true,
            block8: true,
        },
    }),

    /*getters: {
        getBotBuyOrders: (state) => (botName) => {
            const ordersStore = useOrdersStore();

            // Ищем бота в массиве по названию
            const bot = state.bots.find(b => b.name === botName);
            if (!bot)  return [];

            // Фильтруем limitOrders по условию: orderNumber есть в placedBuyOrdersIds
            return ordersStore.limitOrders.filter(order =>
                bot.placedBuyOrdersIds.includes(order.data.orderNumber)
            );
        },

    },*/

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
        },


    },

    persist: true,

});
