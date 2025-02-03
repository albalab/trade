/*
import { defineStore } from 'pinia';

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
        activePositions: [
            /!*{
                "volume": 11994.55,
                "currentVolume": 11950,
                "symbol": "EUTR",
                "brokerSymbol": "MOEX:EUTR",
                "portfolio": "D88141",
                "exchange": "MOEX",
                "avgPrice": 119.9455,
                "qtyUnits": 100,
                "openUnits": 0,
                "lotSize": 1,
                "shortName": "ЕвроТранс",
                "qtyT0": 0,
                "qtyT1": 100,
                "qtyT2": 100,
                "qtyTFuture": 100,
                "qtyT0Batch": 0,
                "qtyT1Batch": 100,
                "qtyT2Batch": 100,
                "qtyTFutureBatch": 100,
                "qtyBatch": 100,
                "openQtyBatch": 0,
                "qty": 100,
                "open": 0,
                "dailyUnrealisedPl": 90,
                "unrealisedPl": -34.55,
                "isCurrency": false,
                "existing": false
            },
            {
                "SBER": {
                    "volume": 2769.1,
                    "currentVolume": 2769,
                    "symbol": "SBER",
                    "brokerSymbol": "MOEX:SBER",
                    "portfolio": "D88141",
                    "exchange": "MOEX",
                    "avgPrice": 276.91,
                    "qtyUnits": 10,
                    "openUnits": 0,
                    "lotSize": 10,
                    "shortName": "Сбербанк",
                    "qtyT0": 0,
                    "qtyT1": 10,
                    "qtyT2": 10,
                    "qtyTFuture": 10,
                    "qtyT0Batch": 0,
                    "qtyT1Batch": 1,
                    "qtyT2Batch": 1,
                    "qtyTFutureBatch": 1,
                    "qtyBatch": 1,
                    "openQtyBatch": 0,
                    "qty": 1,
                    "open": 0,
                    "dailyUnrealisedPl": 25.3,
                    "unrealisedPl": -0.1,
                    "isCurrency": false,
                    "existing": false
                }
            },
            {
                "MTLR": {
                    "volume": 103.18,
                    "currentVolume": 103.17,
                    "symbol": "MTLR",
                    "brokerSymbol": "MOEX:MTLR",
                    "portfolio": "D88141",
                    "exchange": "MOEX",
                    "avgPrice": 103.18,
                    "qtyUnits": 1,
                    "openUnits": 0,
                    "lotSize": 1,
                    "shortName": "Мечел ао",
                    "qtyT0": 0,
                    "qtyT1": 1,
                    "qtyT2": 1,
                    "qtyTFuture": 1,
                    "qtyT0Batch": 0,
                    "qtyT1Batch": 1,
                    "qtyT2Batch": 1,
                    "qtyTFutureBatch": 1,
                    "qtyBatch": 1,
                    "openQtyBatch": 0,
                    "qty": 1,
                    "open": 0,
                    "dailyUnrealisedPl": 0,
                    "unrealisedPl": 0,
                    "isCurrency": false,
                    "existing": false
                }
            },*!/
        ],

        limitOrders: [
            /!*{
          data: {
            symbol: "SBER",
            orderNumber: 3214543,
          }
        },
        {
          data: {
            symbol: "LKOH",
            orderNumber: 3214547,
          }
        }*!/
        ]

    }),
});
*/


// src/stores/ordersStore.js

import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import {
    getPositions,
    getOrders,
    sendGroupLimitOrders,
    cancelGroupOrders,
    cancelAllOrders,
    //sendLimitOrder,
} from '@/services/LimitOrderService';

export const useOrdersStore = defineStore('ordersStore', {
    state: () => ({
        limitOrders: [],
        activePositions: {},
        // другие нужные поля...
        socketOrders: null,
        socketPositions: null,
    }),

    actions: {
        processOrders(orders) {
            orders.forEach((order) => {
                const { id, status } = order;

                if (status === 'working') {
                    const existingOrder = this.limitOrders.find((o) => o.data.id === id);
                    if (!existingOrder) {
                        const enrichedOrder = {
                            ...order,
                            orderNumber: order.id,
                        };
                        this.limitOrders.push({ data: enrichedOrder });
                    }
                } else if (status === 'canceled' || status === 'filled') {
                    this.limitOrders = this.limitOrders.filter((o) => o.data.id !== id);
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

        // Методы для отправки/отмены ордеров
        async sendGroupLimitOrders(orders) {
            return await sendGroupLimitOrders(orders);
        },

        async cancelAllOrders(exchange, portfolio) {
            return await cancelAllOrders(exchange, portfolio);
        },
        async sendLimitOrder(volume, price, ticker, exchange, side, portfolio, extra = {}) {
            //const response = await sendLimitOrder(volume, price, ticker, exchange, side, portfolio);
            // допустим, вернулся { success: true, data: { orderNumber: '12345', message: 'OK' } }

            let response = { success: true, data: { orderNumber: uuidv4(), message: 'OK' } };



            // 2) Сохраняем заявку в state (или дождёмся WebSocket?)
            // Но обычно сохраняем сразу с минимальным набором данных:
            const newOrder = {
                    ...response.data,
                    status: 'working',
                    side,
                    ticker,
                    exchange,
                    price,
                    volume,
                    qty: 1,
                    // ...можно добавить поле botId, если передали extra.botId
                    botId: extra ?? null
            };
            this.limitOrders.push({ data: newOrder });

            console.log(extra);

            return newOrder;
        },

        async cancelGroupOrders(payload) {

            const orderIds = [...payload.orderIds];

            console.log(orderIds);

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

        // Подключение к WebSocket по заявкам
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

        // Подключение к WebSocket по позициям
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
