(function() {
    'use strict';

    const triggerTicker = "CHMF";

    const allowedTickers = ['SBER', 'LKOH', 'NVTK', 'CHMF'];

    if (!allowedTickers.includes(triggerTicker)) return;


    /*setInterval(() => {
        console.log(window.alorTrade);
    }, 3000);*/


    window.addEventListener("robot1message", (event) => {
        // Проверка на источник, чтобы убедиться, что данные приходят от ожидаемого `iframe`
        console.log("Получено сообщение от iframe:", event.data);
        if (event.origin === "https://trade-6rl.pages.dev/#/alorcandles") {
            //console.log("Получено сообщение от iframe:", event.data);
        }
    });



    const checkAlorTradeInterval = setInterval(() => {
        // Проверяем доступность window.myStorage и window.myStorage.alorTrade
        if (window.myStorage && window.myStorage.alorTrade) {
            // Как только объект становится доступен, устанавливаем прокси
            window.myStorage = new Proxy(window.myStorage, {
                set(target, property, value) {
                    // Устанавливаем новое значение свойства
                    target[property] = value;

                    // Выводим обновленный объект в консоль
                    //console.log('alorTrade обновлен:', target);

                    // Сообщаем об успешной записи значения
                    return true;
                }
            });

            // Очищаем таймер, так как прокси уже установлен
            clearInterval(checkAlorTradeInterval);
            console.log("Прокси для myStorage.alorTrade установлен.");
        } else if (!window.myStorage) {
            // Если myStorage еще не существует, инициализируем его
            window.myStorage = {};
            console.log("Создан window.myStorage.");
        } else if (!window.myStorage.alorTrade) {
            // Если alorTrade еще не существует в myStorage, инициализируем его как пустой объект
            window.myStorage.alorTrade = {};
            console.log("Создан window.myStorage.alorTrade.");
        }
    }, 1000); // Проверяем каждую секунду




    //window.sendLimitOrder(1, 1150, 'CHMF', 'MOEX', 'buy', 'D88141');

})();