'use strict';

/**
 * чистый сервис с набором функций для REST-запросов,
 * только REST-запросы на бэкенд и никакой логики
 * по обработке полученных данных
 * (кроме самой простой валидации)
 * */

export async function getPositions(exchange, portfolio, format = 'Simple', withoutCurrency = false) {
    try {
        const response = await fetch('https://signalfabric.com/get-positions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exchange, portfolio, format, withoutCurrency }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Не удалось получить позиции');
        }

        console.log('Полученные позиции:', data.data);
        return data.data;
    } catch (error) {
        console.error('Ошибка при получении позиций:', error.message);
        throw error;
    }
}

export async function getOrders(exchange, portfolio, format = 'Simple') {
    try {
        const response = await fetch('https://signalfabric.com/get-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exchange, portfolio, format }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Не удалось получить заявки');
        }
        //console.log('Список заявок:', data.data);
        return data.data;
    } catch (error) {
        console.error('Ошибка при получении заявок:', error.message);
        throw error;
    }
}

export async function sendGroupLimitOrders(orders) {
    try {
        const response = await fetch('https://signalfabric.com/create-group-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orders)
        });

        console.log(orders);

        const data = await response.json();
        console.log("Ответ сервера на создание группы лимитных ордеров:", data);
        return data;
    } catch (error) {
        console.error("Ошибка при создании группы лимитных ордеров:", error.message);
        throw error;
    }
}

export async function cancelGroupOrders({ orderIds, portfolio, exchange, stop = false }) {
    try {
        const response = await fetch('https://signalfabric.com/cancel-group-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderIds,
                portfolio,
                exchange,
                stop
            })
        });
        const data = await response.json();
        console.log("Ответ сервера на отмену группы ордеров:", data);
        return data;
    } catch (error) {
        console.error("Ошибка при отмене группы ордеров:", error.message);
        throw error;
    }
}

export async function cancelAllOrders(exchange, portfolio) {
    const requestData = {
        exchange: exchange,
        portfolio: portfolio,
        stop: false // Укажите true, если нужно учитывать стоп-заявки
    };

    try {
        const response = await fetch('https://signalfabric.com/cancel-all-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        const data = await response.json();
        console.log("Ответ сервера на отмену всех ордеров:", data);
        return data;
    } catch (error) {
        console.error("Ошибка при отмене всех ордеров:", error.message);
        throw error;
    }
}

export async function sendLimitOrder(volume, price, ticker, exchange, side, portfolio) {
    const orderDetails = {
        side: side,
        quantity: volume,
        price: price,
        instrument: {
            symbol: ticker,
            exchange: exchange,
            instrumentGroup: "TQBR"
        },
        user: { portfolio: portfolio },
        timeInForce: "oneday"
    };

    try {
        const response = await fetch('https://signalfabric.com/limit-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetails)
        });
        const data = await response.json();
        console.log("Ответ сервера:", data);
        return data;
    } catch (error) {
        console.error("Ошибка при отправке лимитного ордера:", error.message);
        throw error;
    }
}
