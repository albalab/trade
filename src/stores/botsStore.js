import { defineStore } from "pinia";

export const useBotsStore = defineStore("botsStore", {
    state: () => ({
        // Массив ботов:
        bots: [
            {
                id: "SBER_1",
                symbol: "SBER",

                // Параметры/состояние (как в вашем meshbotStore):
                initialPrice: 10000,
                currentPrice: 10000,
                priceStart: 10000,
                priceStep: 1,
                priceStepMultiplier: 10,
                gridStep: 20,
                takeProfitDistance: 20,
                levelsCount: 10,
                volume: 2,
                volatility: 1,
                interval: 10,
                enableRestore: true,
                restoreCount: 300,
                enableGridShift: true,
                gridShiftIntervals: [2000, 3000, 7000],
                enableTpShift: false,
                maxOpenTrades: 10,

                buyLevels: [],
                sellOrders: [],
                openTrades: [],
                closedTrades: [],
                priceData: [],
                remainingRestoreCount: 300,
                timeIndex: 0,
                buyPoints: [],
                sellPoints: [],
                myLimitOrdersIds: [],
                totalProfit: 0,

                // Можно хранить ID setInterval для “симуляции”
                simulationId: null,
                // А также любые другие вспомогательные поля
                linesData: [],
            },
            // Можно добавить ещё ботов:
            // { id: "SBER_2", symbol: "SBER", ... },
            // { id: "GAZP_1", symbol: "GAZP", ... },
        ],

        // Какой бот “активный” (будет использоваться в компоненте)
        activeBotId: "SBER_1",
    }),

    getters: {
        activeBot(state) {
            return state.bots.find(bot => bot.id === state.activeBotId) || null;
        },
        getBotById: (state) => (botId) => {
            return state.bots.find(bot => bot.id === botId) || null;
        },
    },

    actions: {
        setActiveBot(botId) {
            const found = this.bots.find(bot => bot.id === botId);
            if (found) {
                this.activeBotId = botId;
            } else {
                console.warn(`Бот с id="${botId}" не найден в массиве bots`);
            }
        },

        createBot(config = {}) {
            const newId = config.id || ("BOT_" + Date.now());
            if (this.bots.find(bot => bot.id === newId)) {
                console.warn(`Бот ${newId} уже существует!`);
                return;
            }
            // Настройки по умолчанию
            const defaultBot = {
                id: newId,
                symbol: "SBER",
                initialPrice: 10000,
                currentPrice: 10000,
                priceStart: 10000,
                priceStep: 1,
                priceStepMultiplier: 10,
                gridStep: 20,
                takeProfitDistance: 20,
                levelsCount: 10,
                volume: 2,
                volatility: 1,
                interval: 10,
                enableRestore: true,
                restoreCount: 300,
                enableGridShift: true,
                gridShiftIntervals: [2000, 3000, 7000],
                enableTpShift: false,
                maxOpenTrades: 10,

                buyLevels: [],
                sellOrders: [],
                openTrades: [],
                closedTrades: [],
                priceData: [],
                remainingRestoreCount: 300,
                timeIndex: 0,
                buyPoints: [],
                sellPoints: [],
                myLimitOrdersIds: [],
                totalProfit: 0,
                simulationId: null,
                linesData: [],
            };
            const newBot = { ...defaultBot, ...config };
            this.bots.push(newBot);
            // Сразу делаем его активным (по желанию)
            this.activeBotId = newId;
            console.log("Создан бот:", newId);
        },

        removeBot(botId) {
            const idx = this.bots.findIndex(bot => bot.id === botId);
            if (idx >= 0) {
                this.bots.splice(idx, 1);
                console.log(`Удалён бот ${botId}`);
            }
        },
    },
});
