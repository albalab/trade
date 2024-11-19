window.addEventListener("message", (event) => {
    // Проверяем, что сообщение содержит нужный тип
    if (event.data && event.data.selectTicker) {
        console.log("selectTicker", event.data.selectTicker);
    } else {
        //console.log("Другое сообщение:", event.data);
    }
});