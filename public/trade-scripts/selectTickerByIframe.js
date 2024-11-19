window.addEventListener("message", (event) => {
    // Проверяем, что сообщение содержит нужный тип
    if (event.data && event.data.selectTicker) {
        window.changeGroupSymbol('tr[object HTMLTableRowElement]', 'group1', event.data.selectTicker);
        console.log("selectTicker", event.data.selectTicker);
    } else {
        //console.log("Другое сообщение:", event.data);
    }
});