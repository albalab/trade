// services/WebSocketService.js

import pako from "pako";
import msgpack from 'msgpack-lite';

class WebSocketService {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.subscribers = {};
        this.visibilityHandler = null;
        this.intentionalClose = false;
    }

    connect() {
        if (this.socket) return;

        this.intentionalClose = false;

        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("WebSocket connected");
        };

        this.socket.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const reader = new FileReader();

                reader.onload = () => {
                    try {
                        // Преобразуем Blob в ArrayBuffer и затем в Uint8Array
                        const compressedData = new Uint8Array(reader.result);
                        const decompressed = pako.inflate(compressedData); // Распаковываем gzip

                        const decoded = msgpack.decode(decompressed); // Декодируем MessagePack

                        this.handleMessage(decoded);
                    } catch (error) {
                        console.error("Ошибка декомпрессии или декодирования:", error);
                    }
                };

                reader.onerror = () => {
                    console.error("Ошибка чтения Blob:", reader.error);
                };

                // Читаем Blob как ArrayBuffer
                reader.readAsArrayBuffer(event.data);
            } else {
                console.error("Получены данные не в формате Blob:", event.data);
            }
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
            this.socket = null;

            // Переподключение только если вкладка активна
            if (!this.intentionalClose && document.visibilityState === "visible") {
                this.reconnect();
            } else if (!this.intentionalClose) {
                console.log("Ожидание активации вкладки для переподключения");
            }
        };

        // Обработчик изменения видимости вкладки
        this.attachVisibilityHandler();
    }

    reconnect() {
        console.log("Reconnecting WebSocket...");
        this.connect();
    }

    handleMessage(data) {
        if (!data) return;

        Object.entries(this.subscribers).forEach(([type, callbacks]) => {
            if (data[type]) {
                callbacks.forEach((callback) => callback(data[type]));
            }
        });
    }

    subscribe(type, callback) {
        if (!this.subscribers[type]) {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push(callback);
    }

    unsubscribe(type, callback) {
        if (!this.subscribers[type]) return;
        this.subscribers[type] = this.subscribers[type].filter(
            (cb) => cb !== callback
        );
    }

    attachVisibilityHandler() {
        if (this.visibilityHandler) return; // Уже добавлено
        this.visibilityHandler = () => {
            if (document.visibilityState === "visible" && !this.socket && !this.intentionalClose) {
                console.log("Вкладка активна, восстанавливаем соединение");
                this.reconnect();
            }
        };
        document.addEventListener("visibilitychange", this.visibilityHandler);
    }

    detachVisibilityHandler() {
        if (this.visibilityHandler) {
            document.removeEventListener("visibilitychange", this.visibilityHandler);
            this.visibilityHandler = null;
        }
    }

    close() {
        if (this.socket) {
            this.intentionalClose = true;
            this.socket.close();
            this.socket = null;
        }
        this.detachVisibilityHandler();
        console.log("WebSocket закрыт и обработчики удалены");
    }
}

const webSocketService = new WebSocketService("wss://signalfabric.com/datastream/");
export default webSocketService;
