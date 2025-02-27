import { defineStore } from "pinia";
import { useOrdersStore } from '@/stores/ordersStore';

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
    gridShiftIntervals: [ 11, 17, 47], //секунды
    priceStep: 1,
    priceStepMultiplier: 10,
    volatility: 1,
    interval: 1000,
    priceStart: 10000,
    priceData: [],

    isGenerateData: true,
    isRealTrading: false,
};

export const useMeshbotStore = defineStore("meshbot", {
    state: () => ({

        displayMode: 'all',
        latestWindowSize: 100,

        activeBotName: null,


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

        addSellPoint(botName, point) {
            const bot = this.bots.find(b => b.name === botName);
            if (bot && bot.settings) {
                bot.settings.sellPoints.push(point);
            }
        },

        updateBotSetting(botName, key, value) {
            const bot = this.bots.find(b => b.name === botName);
            if (bot && bot.settings) {
                bot.settings[key] = value;
            }
        },

        setActiveBotName(botName) {
            this.activeBotName = botName;
        },

        createBot({ market, board, ticker, customSettings }) {
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

            // Создаем глубокую копию настроек:
            const settings = JSON.parse(JSON.stringify({
                ...defaultSettingsBot,
                ...(customSettings || {}),
                isTradingActive: false // Флаг активности по умолчанию
            }));

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
            this.activeBotName = this.bots[this.bots.length - 1].name;

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

        deleteBot(botName) {
            const index = this.bots.findIndex(bot => bot.name === botName);
            if (index !== -1) {
                this.bots.splice(index, 1);
                if (this.bots.length > 0) {
                    this.activeBotName = this.bots[Math.max(index - 1, 0)].name;
                } else {
                    this.activeBotName = null;
                }
            }
        },

        resetBotState(botName) {
            console.log("Сброс состояния через Pinia вызван!");

            const bot = this.bots.find(bot => bot.name === botName);
            if (!bot) {
                console.warn("Бот не найден. Сброс состояния не выполнен.");
                return;
            }

            const ordersStore = useOrdersStore();
            ordersStore.cancelBotBuyOrders(botName);

            Object.assign(bot.settings, {
                currentPrice: bot.settings.initialPrice,
                timeIndex: 0,
                buyLevels: [],
                profitLevels: [],
                openTrades: [],
                closedTrades: [],
                totalProfit: 0,
                priceData: [],
                linesData: [],
                buyPoints: [],
                sellPoints: [],
                remainingRestoreCount: bot.settings.restoreCount,
            });

            bot.settings.priceData.push(
                { x: 0, y: bot.settings.initialPrice },
                { x: 1, y: bot.settings.initialPrice }
            );

            this.initBuyLevels(botName);
        },

        initBuyLevels(botName) {
            const bot = this.bots.find(bot => bot.name === botName);
            if (!bot || !bot.settings) return;

            console.log("Инициализация уровней покупки для бота...");

            bot.settings.buyLevels = [];
            bot.settings.linesData = bot.settings.linesData.filter(line => !line.id.startsWith("BUY_"));

            for (let i = 1; i <= bot.settings.levelsCount; i++) {
                if (bot.settings.buyLevels.length >= bot.settings.levelsCount) {
                    console.log("Превышен лимит лимиток. Новые лимитки не будут выставлены.");
                    break;
                }

                if (this.isPositionLimitReached(botName)) {
                    console.log("Превышен лимит позиций. Новые позиции не будут выставлены.");
                    break;
                }

                const levelPrice = bot.settings.currentPrice - i * bot.settings.gridStep;

                bot.settings.buyLevels.push({
                    price: levelPrice,
                    volume: bot.settings.volume,
                });

                bot.settings.linesData.push({
                    id: "BUY_" + levelPrice,
                    price: levelPrice,
                    color: "rgba(255,183,77,0.7)",
                });
            }
        },

        isPositionLimitReached(botName) {
            const bot = this.bots.find(bot => bot.name === botName);
            if (!bot || !bot.settings) return false;

            return (
                bot.settings.openTrades.length + bot.settings.buyLevels.length >= bot.settings.maxOpenTrades
            );
        },

        removeLine(botName, lineId) {
            const bot = this.bots.find(bot => bot.name === botName);
            if (!bot || !bot.settings || !lineId) return;

            const idx = bot.settings.linesData.findIndex(line => line.id === lineId);
            if (idx >= 0) {
                bot.settings.linesData.splice(idx, 1);
                console.log(`Линия с ID "${lineId}" удалена.`);
            }
        },

    },

    persist: true,
/*
{
    paths: ['bots', 'activeBotIndex']
}*/

});
