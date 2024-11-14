// helper.js
export function throttle(fn, delay) {
    let lastCall = 0;
    let lastArgs = null;
    let timeoutId = null;

    return (...args) => {
        const now = new Date().getTime();

        // Если прошло достаточно времени, выполняем функцию сразу
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        } else {
            // Иначе сохраняем последние аргументы для выполнения
            lastArgs = args;

            // Если таймер еще не запущен, запускаем его
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    fn(...lastArgs); // Выполняем с последними аргументами
                    lastCall = new Date().getTime();
                    timeoutId = null; // Сбрасываем таймер
                }, delay - (now - lastCall));
            }
        }
    };
}
