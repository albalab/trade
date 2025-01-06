import { defineStore } from 'pinia';

export const useLimitOrdersStore = defineStore('limitOrders', {
    state: () => ({
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
