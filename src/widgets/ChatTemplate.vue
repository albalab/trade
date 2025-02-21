<template>
  <div class="chat">

    <div class="openai">

      <div>
        <input v-model="openaiStore.apiKey" placeholder="apiKey"/>
      </div>

      <div v-if="openaiStore.apiKey">

        <div class="title-ai">Запрос с контекстом</div>

        <div class="item">
          <div class="name"> inputContext: </div>
          <textarea v-model="openaiStore.inputContext"></textarea>
        </div>

        <div class="item">
          <div class="name"> inputText: </div>
          <textarea v-model="openaiStore.inputText"></textarea>
        </div>

        <div class="item">
          <button class="btn" @click="cleanText">Отправить запрос</button>
        </div>

        <div class="item">
          <div class="name"> cleanedText: </div>
          <textarea v-model="openaiStore.cleanedText"></textarea>
        </div>

        <div class="title-ai">Запрос вектора</div>

        <div class="item">
          <div class="name"> inputEmbedding: </div>
          <textarea v-model="openaiStore.inputEmbedding"></textarea>
        </div>

        <button class="btn" @click="fetchEmbedding">Получить вектор</button>

        <div class="item">
          <div class="name"> embedding: </div>
          <textarea v-model="openaiStore.embedding"></textarea>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { useDataFabricStore } from '@/stores/dataFabricStore';
import { useOpenaiStore } from '@/stores/openaiStore';
import OpenAI from 'openai';

export default {

  setup() {
    const dataFabric = useDataFabricStore();
    const openaiStore = useOpenaiStore();

    return {
      openaiStore,
      dataFabric,
    }
  },
  data() {
    return {

      openai: null,

    };
  },
  methods: {
    initOpenAI() {
      this.openai = new OpenAI({
        apiKey: this.openaiStore.apiKey,
        dangerouslyAllowBrowser: true
      });
    },

    async getEmbedding(text) {
      try {
        const response = await this.openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
          encoding_format: "float" // Убедитесь, что этот параметр поддерживается
        });

        // Извлекаем эмбеддинг из ответа
        return response.data[0].embedding;
      } catch (error) {
        console.error('Ошибка при получении эмбеддинга:', error);
        throw error;
      }
    },

    async fetchEmbedding() {
      try {
        this.openaiStore.embedding = await this.getEmbedding(this.openaiStore.inputText);
      } catch (error) {
        console.error('Ошибка при получении эмбеддинга:', error);
      }
    },

    async cleanTextWithChatGPT() {
      const apiKey = this.openaiStore.apiKey;
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const prompt = `${this.openaiStore.inputContext} \n\n\n ${this.openaiStore.inputText}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        const cleanedText = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content.trim() : '';
        return cleanedText;
      } catch (error) {
        console.error('Error during API call:', error);
        throw new Error('Failed to clean text');
      }
    },
    async cleanText() {
      try {
        this.openaiStore.cleanedText = await this.cleanTextWithChatGPT();
      } catch (error) {
        this.openaiStore.cleanedText = 'Ошибка при очистке текста: ' + error.message;
      }
    },
  },
  mounted() {
    this.initOpenAI();
  },
  beforeUnmount() {

  }
};
</script>

<style>
.sound-language {
  text-align: center;
  color: #fff;
  background-color: #000;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.controls button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #444;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.controls button:hover {
  background-color: #666;
}

.beacon-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.beacon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #111;
  transition: background-color 0.3s;
}
</style>
