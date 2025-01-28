import { defineStore } from 'pinia';

export const useOpenaiStore = defineStore('openai', {
    state: () => ({
        apiKey: null,
        inputContext: null,
        inputText: null,
        cleanedText: null,

        inputEmbedding: null,
        embedding: null,

    }),
    persist: true,
});
