import { defineStore } from "pinia";
//import { useOrdersStore } from '@/stores/ordersStore';

const defaultSettingsBot = {
    maxOpenTrades: 10,
    initialPrice: 10000,
    currentPrice: 10000,
    gridStep: 20,
    levelsCount: 3,
    volume: 1,
    takeProfitDistance: 10,
    enableRestore: true,
    restoreCount: 300,
    enableGridShift: true,
    enableTpShift: false,
    totalProfit: 0,
    buyLevels: [],
    placedProfitOrders: [],
    profitLevels: [],
    openTrades: [],
    closedTrades: [],
    timeIndex: 0,
    buyPoints: [],
    sellPoints: [],
    remainingRestoreCount: 300,
    linesData: [],
    gridShiftIntervals: [19000, 31000],
    priceStep: 1,
    priceStepMultiplier: 10,
    volatility: 1,
    interval: 1000,
    priceStart: 10000,
    priceData: [],
};

export const useMeshbotStore = defineStore("meshbot", {
    state: () => ({

        displayMode: 'all',
        latestWindowSize: 100,

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

        createBot({ market, board, ticker }) {
            // Генерируем имя нового бота
            const botsWithTicker = this.bots.filter(bot => bot.ticker === ticker);
            const indices = botsWithTicker.map(bot => {
                const match = bot.name.match(/\d+$/);
                return match ? parseInt(match[0], 10) : 0;
            });
            const nextIndex = indices.length ? Math.max(...indices) + 1 : 1;
            const name = `${ticker} ${nextIndex}`;

            // Если copySettings переданы, можно их использовать
            /*const settings = copySettings
                ? { ...defaultSettingsBot, ...copySettings }
                : JSON.parse(JSON.stringify(defaultSettingsBot));*/
            //const settings = JSON.parse(JSON.stringify(copySettings || defaultSettingsBot));

            const settings = { ...defaultSettingsBot };
            //console.log(settings);

            const newBot = {
                market,
                board,
                ticker,
                name,
                settings,
            };

            // Обновляем массив новым объектом
            this.bots = [...this.bots, newBot];
            this.activeBotIndex = this.bots.length - 1;

            /*localStorage.setItem('meshbot', JSON.stringify({
                bots: this.bots,
                activeBotIndex: this.activeBotIndex
            }));*/

            return newBot;
        },

        /*createBot(botData) {
            this.bots.push(botData);
            this.setActiveBotIndex(this.bots.length - 1);
        },*/

        deleteBot(index) {
            this.bots.splice(index, 1);
            if (this.activeBotIndex >= index) {
                this.activeBotIndex = Math.max(this.activeBotIndex - 1, 0);
            }
        },


    },

    persist: {
        paths: ['bots', 'activeBotIndex']
    },

});
