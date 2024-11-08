// widgetManager.js
const getReactFiberKeyString = (node) => {
    return Object.keys(node).find(
        (key) =>
            key.startsWith("__reactInternalInstance$") ||
            key.startsWith("__reactFiber$")
    );
};

const createCustomWidget = (widgetConfig) => {
    const space_node = document.querySelector("#SpacePanel");
    if (!space_node) {
        console.error("SpacePanel не найден.");
        return false;
    }

    const fiber = getReactFiberKeyString(space_node);
    if (!fiber) {
        console.error("React Fiber не найден.");
        return false;
    }

    return space_node[fiber].return.memoizedProps.addWidget({
        pinned: false,
        widgetType: "LIGHT_TV_WIDGET",
        payload: { widgetName: widgetConfig.widgetName }
    });
};

export const createCandlesWidget = (widgetConfig) => {
    const widget = createCustomWidget(widgetConfig);
    if (!widget) {
        console.error("Не удалось создать виджет.");
        return;
    }

    const { widgetId } = widget.payload;
    const widget_ids = JSON.parse(localStorage.getItem(widgetConfig.localStorageKey)) || [];
    widget_ids.push(widgetId);
    localStorage.setItem(widgetConfig.localStorageKey, JSON.stringify(widget_ids));

    console.log(`Создан виджет с ID: ${widgetId}`);
};

// Инициализация iframe для каждого виджета и отправка сообщений
export const initializeIframes = (widgetsConfig) => {
    setTimeout(() => {
        widgetsConfig.forEach(widgetConfig => {
            let widgets = localStorage.getItem(widgetConfig.localStorageKey);
            if (widgets) {
                try {
                    widgets = JSON.parse(widgets);
                    widgets.forEach(widgetId => {
                        let elements = document.querySelectorAll(`[data-widget-id="${widgetId}"]`);
                        elements.forEach(element => {
                            let widgetBlock = element.querySelector('.widget');
                            if (widgetBlock) {
                                widgetBlock.innerHTML = `<iframe src="${widgetConfig.iframeUrl}" style="width: 100%; height: 100%;" class="custom-iframe"></iframe>`;
                                let iframe = widgetBlock.querySelector('iframe.custom-iframe');
                                if (iframe) {
                                    function sendMessage() {
                                        const message = { time: new Date().toISOString(), data: "Your message here" };
                                        iframe.contentWindow.postMessage(message, '*');
                                    }
                                    setInterval(sendMessage, 10000); // 10 секунд
                                }
                            }
                        });
                    });
                } catch (e) {
                    console.error(`Ошибка при обработке ${widgetConfig.localStorageKey}:`, e);
                }
            }
        });
    }, 10000); // Задержка в 10 секунд
};
