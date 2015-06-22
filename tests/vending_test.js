function colourTrace(msg, color) {
    console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
}

function assert(condition, success, fail) {
    if (!condition) {
        colourTrace(fail, 'red');
        return
    }
    colourTrace(success, 'green');
}

function startTests() {
    // Make sure we have access to the angular scope
    controllerElement = $('body');
    controllerScope = angular.element(controllerElement).scope();
    // Check all items are in the stock, sales and admin tables
    assert($('#stockTable tbody > tr').length === 10, 'Stock table has 10 rows', 'Stock table has wrong number of rows (' + $('#stockTable tbody > tr').length + ')');
    assert($('#salesTable tbody > tr').length === 10, 'Sales table has 10 rows', 'Sales table has wrong number of rows (' + $('#stockTable tbody > tr').length + ')');
    assert($('#adminTable tbody > tr').length === 10, 'Admin table has 10 rows', 'Admin table has wrong number of rows (' + $('#stockTable tbody > tr').length + ')');

    // Check totals
    assert(controllerScope.totalItems === 137,
        'Item total is 137',
        'Total items is incorrect (' + controllerScope.totalItems + ')');
    assert(controllerScope.totalSold === 39,
        'Total items sold is 39',
        'Total items sold is incorrect (' + controllerScope.totalSold + ')');
    assert(controllerScope.totalSales === 3480,
        'Total sales value is 3480',
        'Total sales value is incorrect (' + controllerScope.totalSales + ')');

    // Check display is 2 decimal places
    decimal_regex = /\.\d{2}$/;
    assert(decimal_regex.test($('#total_sales').text().substr(-3)),
        'Total sales display has 2 decimal places',
        'The format of the total sales display does not have 2 decimal places (' + $('#total_sales').text() + ')');
    // Check stock warning message
    assert(
        (controllerScope.remainingPercent < 25 && $('#stock_message').is(':visible') ||
            (controllerScope.remainingPercent >= 25 && !$('#stock_message').is(':visible'))),
        'Stock message display is correct',
        'The stock message is displaying incorrectly');
}
