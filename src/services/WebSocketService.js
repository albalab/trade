// services/WebSocketService.js
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
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error("Failed to process WebSocket message:", error);
            }
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
            this.socket = null;
        };
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
