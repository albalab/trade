import { defineStore } from "pinia";
import { useOrdersStore } from '@/stores/ordersStore';

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

    // в meshbotStore
    getters: {
        /**
         * Возвращает все заявки (из ordersStore.limitOrders),
         * которые принадлежат боту с указанным именем (botName).
         */
        getBotBuyOrders: (state) => (botName) => {
            // Подтягиваем ordersStore
            const ordersStore = useOrdersStore();

            // Ищем бота в массиве по названию
            const bot = state.bots.find(b => b.name === botName);
            if (!bot) {
                // Если бота с таким именем нет — пустой массив
                return [];
            }

            // Если поле placedBuyOrdersIds пустое или нет — тоже пустой массив
            if (!bot.settings.placedBuyOrdersIds || bot.settings.placedBuyOrdersIds.length === 0) {
                return [];
            }

            // Фильтруем глобальный список limitOrders,
            // оставляя только те, чей orderNumber есть в placedBuyOrdersIds
            return ordersStore.limitOrders.filter(order =>
                bot.settings.placedBuyOrdersIds.includes(order.data.orderNumber)
            );
        },
    },

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

        async placeBuyOrder(botName, price, volume) {
            const bot = this.bots.find(b => b.name === botName);
            if (!bot) {
                console.error(`Бот с именем ${botName} не найден`);
                return;
            }

            const ordersStore = useOrdersStore();
            const newOrder = await ordersStore.sendLimitOrder(
                volume,
                price,
                bot.ticker,
                bot.market || 'MOEX',
                'buy',
                'D88141',
                 botName
            );

            /*const newOrder = {
                qty: volume,
                price: price,
                ticker: 'MTLR',
                exchange: 'MOEX',
                side: 'buy',
                portfolio: 'D88141',
                botId: botName,
                orderNumber: '12345',
            };*/

            // Если в объекте бота placedBuyOrdersIds лежит на верхнем уровне:
            if (!bot.settings.placedBuyOrdersIds) {
                bot.settings.placedBuyOrdersIds = [];
            }
            bot.settings.placedBuyOrdersIds.push(newOrder.orderNumber);
        },

        async cancelBotOrders(botName) {
            const bot = this.bots.find(b => b.name === botName);
            if (!bot) {
                console.error(`Бот с именем ${botName} не найден`);
                return;
            }


            if (!bot.settings.placedBuyOrdersIds?.length) return;

            console.log('Meshbot: Cancel Bot Orders: ', bot.settings.placedBuyOrdersIds);

            const ordersStore = useOrdersStore();
            await ordersStore.cancelGroupOrders({
                orderIds: bot.settings.placedBuyOrdersIds,
                portfolio: 'D88141',
                exchange: 'MOEX',
                stop: false,
            });

            bot.settings.placedBuyOrdersIds = [];

        },


    },

    persist: true,

});
