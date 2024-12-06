// services/WebSocketService.js

import pako from "pako";
import msgpack from 'msgpack-lite';

class WebSocketService {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.subscribers = {};
    }

    connect() {
        if (this.socket) return;

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
                        //console.log("Распакованные данные:", decompressed);

                        const decoded = msgpack.decode(decompressed); // Декодируем MessagePack
                        //console.log("Декодированные данные:", decoded);

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
        };
    }

    processMessage(rawData) {
        try {
            const data = JSON.parse(rawData);
            this.handleMessage(data);
        } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
        }
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
}

const webSocketService = new WebSocketService("wss://signalfabric.com/datastream/");
export default webSocketService;
