import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
    // Состояние (state)
    state: () => ({
        count: 0,
        testObjReactivity: {
            test: 1,
        }
    }),

    // Геттеры (getters)
    getters: {
        doubleCount: (state) => state.count * 2,
    },

    // Действия (actions)
    actions: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
    },
});
