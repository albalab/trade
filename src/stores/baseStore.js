import { defineStore } from "pinia";

export const useBaseStore = defineStore("baseStore", {
    state: () => ({
        isSidebarShow: false,
    }),

    persist: true,
});
