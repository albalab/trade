
import { defineStore } from 'pinia';
import { useMeshbotStore } from '@/stores/meshbotStore';

const meshbotStore = useMeshbotStore();

//import { v4 as uuidv4 } from 'uuid';

import {
    getPositions,
    getOrders,
    sendGroupLimitOrders,
    cancelGroupOrders,
    cancelAllOrders,
    sendLimitOrder,
} from '@/services/limitOrderService';

export const useOrdersStore = defineStore('ordersStore', {
    state: () => ({
        limitOrders: [],
        activePositions: {},
        // другие нужные поля...
        socketOrders: null,
        socketPositions: null,
    }),

    getters: {
        limitOrdersWorking(state) {
            return state.limitOrders.filter(order => order.data.status === 'working')
        },
    },

    actions: {
        /*processOrders(orders) {
            orders.forEach((order) => {
                const { id, status } = order;

                if (status === 'working') {
                    const existingOrder = this.limitOrders.find((o) => o.data.id === id || o.data.orderNumber === order.id);

                    //const existingOrder = this.limitOrders.find((o) => o.data.id === id);
                    if (!existingOrder) {
                        const enrichedOrder = {
                            ...order,
                            orderNumber: order.id,
                        };
                        this.limitOrders.push({ data: enrichedOrder });
                    }
                } else if (status === 'canceled' || status === 'filled') {
                    //this.limitOrders = this.limitOrders.filter((o) => o.data.id !== id);


                    // Чтобы watcher увидел изменения и перерисовал график.
                    // Найти существующий ордер
                    /!*const idx = this.limitOrders.findIndex(o => o.data.id === id);
                    if (idx > -1) {
                        // Обновляем статус ордера (или добавляем флаг)
                        this.limitOrders[idx].data.pendingToWatcherStatus = status;
                        // После короткой задержки удаляем ордер (например, через 500 мс)
                        setTimeout(() => {
                            this.limitOrders = this.limitOrders.filter((o) => o.data.id !== id);
                        }, 10);
                    }*!/
                }
            });
        },*/

        processOrders(orders) {
            orders.forEach((order) => {

                // Нормализуем - добавляем orderNumber из id
                if (!order.orderNumber && order.id) {
                    order.orderNumber = order.id;
                }
                // Если по-прежнему нет orderNumber — пропускаем этот ордер
                if (!order.orderNumber) return;

                const { orderNumber, status } = order;

                if (status === 'working' || status === 'filled') {

                    const existingOrder = this.limitOrders.find(o => o.data.orderNumber === orderNumber);
                    if (!existingOrder && !order.botId) {
                        return;
                    }

                    if (existingOrder) {
                        // Обновляем только статус
                        existingOrder.data.status = status;
                    } else {
                        // Если ордера нет – добавляем его с текущим статусом
                        const enrichedOrder = {
                            ...order,
                            orderNumber: orderNumber,
                        };
                        this.limitOrders.push({ data: enrichedOrder });
                    }
                } else if (status === 'canceled') {
                    // Удаляем ордер с canceled статусом
                    this.limitOrders = this.limitOrders.filter(o =>
                        o.data.orderNumber !== orderNumber
                    );
                }
            });
        },

        async fetchAll() {
            try {
                const [orders, positions] = await Promise.all([
                    getOrders('MOEX', 'D88141', 'Simple'),
                    getPositions('MOEX', 'D88141', 'Simple', false),
                ]);

                // Обновляем store
                this.processOrders(orders);

                const activePositions = {};
                positions.forEach((pos) => {
                    if (pos.symbol !== 'RUB' && pos.currentVolume !== 0) {
                        activePositions[pos.symbol] = pos;
                    }
                });
                this.activePositions = activePositions;

            } catch (error) {
                console.error('Ошибка при загрузке всех данных:', error);
            }
        },

        async fetchOrders() {
            try {
                const orders = await getOrders('MOEX', 'D88141', 'Simple');
                this.processOrders(orders);
            } catch (error) {
                console.error('Ошибка при загрузке заявок:', error);
            }
        },

        async fetchPositions() {
            try {
                const positions = await getPositions('MOEX', 'D88141', 'Simple', false);
                const activePositions = {};
                positions.forEach((pos) => {
                    if (pos.symbol !== 'RUB' && pos.currentVolume !== 0) {
                        activePositions[pos.symbol] = pos;
                    }
                });
                this.activePositions = activePositions;
            } catch (error) {
                console.error('Ошибка при загрузке позиций:', error);
            }
        },


        async sendGroupLimitOrders(orders, extra = {}) {
            const response = await sendGroupLimitOrders(orders);

            orders.forEach( order => {

                const newOrder = {
                    ...response.data,
                    status: 'working',
                    side: 'buy',
                    quantity: 1,
                    ticker: order.symbol,
                    exchange: "MOEX",
                    price: order.price,
                    volume: 1,
                    qty: 1,
                    botId: extra ?? null
                };
                this.limitOrders.push({ data: newOrder });

            });

            return response;
        },

        async sendLimitOrder(volume, price, ticker, exchange, side, portfolio, extra = {}) {

            const response = await sendLimitOrder(volume, price, ticker, exchange, side, portfolio);

            // Пример response { success: true, data: { orderNumber: '12345', message: 'OK' } }

            if(!response?.data?.orderNumber) return;

            const newOrder = {
                ...response.data,
                status: 'working',
                side,
                ticker,
                exchange,
                price,
                volume,
                qty: 1,
                botId: extra ?? null
            };
            if (!this.limitOrders.some(order => order.data.orderNumber === newOrder.orderNumber)) {
                this.limitOrders.push({ data: newOrder });

                /*const bot = meshbotStore.bots.find(b => b.name === extra);
                if(!bot) return;
                if (!bot.placedBuyOrdersIds.includes(newOrder.orderNumber)) {
                    bot.placedBuyOrdersIds.push(newOrder.orderNumber);
                }*/

            }

            return newOrder;
        },

        async sendLimitBuyOrder(volume, price, ticker, exchange, side, portfolio, extra = {}) {
            const response = await sendLimitOrder(volume, price, ticker, exchange, side, portfolio);

            if(!response?.data?.orderNumber) return;

            const newOrder = {
                    ...response.data,
                    status: 'working',
                    side,
                    ticker,
                    exchange,
                    price,
                    volume,
                    qty: 1,
                    botId: extra ?? null,
                    orderNumber: response.data.orderNumber
            };
            if (!this.limitOrders.some(order => order.data.orderNumber === newOrder.orderNumber)) {
                this.limitOrders.push({ data: newOrder });

                /*const bot = meshbotStore.bots.find(b => b.name === extra);
                if(!bot) return;
                if (newOrder.side === 'buy' && !bot.placedBuyOrdersIds.includes(newOrder.orderNumber)) {
                    bot.placedBuyOrdersIds.push(newOrder.orderNumber);
                }*/

            }

            return newOrder;
        },

        async cancelAllOrders(exchange, portfolio) {
            this.limitOrders = [];
            return await cancelAllOrders(exchange, portfolio);
        },

        async cancelBotBuyOrders(botName) {
            const bot = meshbotStore.bots.find(b => b.name === botName);
            if (!bot) return;

            //if (!bot.placedBuyOrdersIds?.length) return;

            const myBuyOrderNumbers = this.limitOrders
                .filter(o =>
                    o.data.botId === botName &&
                    o.data.side === 'buy' &&
                    o.data.status === 'working')
                .map(o => o.data.orderNumber);

             if(!myBuyOrderNumbers.length) {
                   console.log('Нет ордеров на покупку для бота:', botName);
                   return;
             }

            console.log('Meshbot: Cancel Bot Orders: ', myBuyOrderNumbers);

            await this.cancelGroupOrders({
                orderIds: myBuyOrderNumbers,
                portfolio: 'D88141',
                exchange: 'MOEX',
                stop: false,
            });

            //bot.placedBuyOrdersIds = [];

        },

        async cancelBotOrders(botName) {
            const bot = meshbotStore.bots.find(b => b.name === botName);
            if (!bot) return;

            //if (!bot.placedBuyOrdersIds?.length) return;

            const myOrderNumbers = this.limitOrders
                .filter(o =>
                    o.data.botId === botName &&
                    o.data.status === 'working'
                )
                .map(o => o.data.orderNumber);

            if (!myOrderNumbers.length) return;

            console.log('Meshbot: Cancel Bot Orders: ', myOrderNumbers);

            await this.cancelGroupOrders({
                orderIds: myOrderNumbers,
                portfolio: 'D88141',
                exchange: 'MOEX',
                stop: false,
            });

            //bot.placedBuyOrdersIds = [];

        },

        async cancelGroupOrders(payload) {

            const orderIds = [...payload.orderIds];

            console.log('meshbotStore: cancelGroupOrders ', orderIds);

            const response = await cancelGroupOrders(payload);

            // Вариант A: сразу отфильтровать заявки
            //    this.limitOrders = this.limitOrders.filter(o =>
            //      !orderIds.includes(o.data.orderNumber)
            //    );

            this.limitOrders = this.limitOrders.filter(o =>
              !orderIds.includes(o.data.orderNumber)
            );

            // Вариант B: дождаться WebSocket события `status: "canceled"`
            //  чтобы processOrders() само удалило/обновило заявки.
            //  (чаще практикуется этот вариант)

            return response;

            /*const newOrder = {
                ...response.data,
                status: 'working',
                side,
                ticker,
                exchange,
                price,
                volume,
                // ...можно добавить поле botId, если передали extra.botId
                botId: extra.botId ?? null
            };*/
            //this.limitOrders.push({ data: newOrder });

        },


        connectToWebSocketOrders() {

            if (this.socketOrders) return;

            this.socketOrders = new WebSocket('wss://signalfabric.com/orders/');

            this.socketOrders.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.data) {
                        this.processOrders([data.data]);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socketOrders.onopen = () => {
                console.log('Connected to WebSocket for orders');
            };

            this.socketOrders.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.socketOrders.onclose = () => {
                console.log('WebSocket connection closed (orders)');
                this.socketOrders = null;
            };
        },

        connectToWebSocketPositions() {

            if (this.socketPositions) return;

            this.socketPositions = new WebSocket('wss://signalfabric.com/positions/');

            this.socketPositions.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.data) {
                        const activePositions = { ...this.activePositions };
                        if (data.data.symbol !== 'RUB') {
                            if (data.data.currentVolume === 0) {
                                delete activePositions[data.data.symbol];
                            } else {
                                activePositions[data.data.symbol] = data.data;
                            }
                            this.activePositions = activePositions;
                        }
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socketPositions.onopen = () => {
                console.log('Connected to WebSocket for positions');
            };

            this.socketPositions.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.socketPositions.onclose = () => {
                console.log('WebSocket connection closed (positions)');
                this.socketPositions = null;
            };
        },
    },
});
