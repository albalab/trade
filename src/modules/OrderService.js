class OrderService {
    constructor() {
        this.ordersStore = {
            limitOrders: [],
            activePositions: {}
        };
        this.subscribers = [];
        this.isConnected = false;
        this.isDataLoaded = false;  // Флаг, который предотвращает повторную загрузку данных
    }

    async fetchInitialData(portfolio, exchange) {
        if (this.isDataLoaded) {
            console.log("Данные уже загружены, пропускаем повторный запрос.");
            return;
        }

        try {
            const [orders, positions] = await Promise.all([
                getOrders(exchange, portfolio),
                getPositions(exchange, portfolio)
            ]);

            this.processOrders(orders);
            this.processPositions(positions);
            this.notifySubscribers();

            this.isDataLoaded = true;  // Устанавливаем флаг после успешной загрузки
        } catch (error) {
            console.error("Ошибка при загрузке начальных данных:", error);
        }
    }

    connectToWebSocket() {
        if (this.isConnected) {
            console.log("WebSocket уже подключён.");
            return;
        }

        const socket = new WebSocket("wss://signalfabric.com/orders/");

        socket.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                if (data && data.data) {
                    this.processOrders([data.data]);
                }
            } catch (error) {
                console.error("Ошибка обработки сообщения WebSocket:", error);
            }
        };

        socket.onopen = () => {
            console.log("WebSocket подключён.");
            this.isConnected = true;
        };

        socket.onerror = error => {
            console.error("Ошибка WebSocket:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket отключён.");
            this.isConnected = false;
        };
    }
}
