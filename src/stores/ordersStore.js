import { defineStore } from 'pinia';

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        activePositions: [
            /*{
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
            },*/
        ],

        limitOrders: [
            /*{
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
        }*/
        ]

    }),
});
