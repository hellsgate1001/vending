function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function isNumber(n) {
    // Validate as number
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var vending = angular.module('vending', []);

vending.controller('VendingList', function ($scope, $http, $window) {
    var stock, prices, sales, swp, totalItems, totalSold, totalSales, maxOrders, popularProduct
        , popularProductPrice, chartCategories, stockData, salesData;

    $scope.chartData = {};
    $scope.editPrices = function() {
        $('#number_warning').addClass('hide');
        /*
        Check that all values are decimal numbers. With this being HTML5, browser
        validation will cause any non-number values to be ignored, ie they will
        evaluate as an empty string ('')
        */
        var changed = false;
        $('input.item_price').each(function(index, element){
            if ($(element).val() != '') {
                if (!isNumber($(element).val())) {
                    $('#number_warning').removeClass('hide');
                    return;
                }
                // We have a valid number, update the appropriate price
                prices[$(element).attr('id')].price = $(element).val();
                changed = true;
            }
        });

        if (changed === true) {
            // At least one price has changed, update display info and calculations
            $scope.prices = prices;
            updateStockWithPrices();
            updateStockWithSales();
        }
    }

    var checkMostPopular = function(item){
        // Check if this is the 'new' most popular product. The product
        // price is used to determine which product should be used in
        // cases where the number of items sold is equal
        if (item.orders.length > maxOrders) {
            maxOrders = item.orders.length;
            popularProduct = item.id;
            popularProductPrice = item.price;
        } else if (item.orders.length == maxOrders && item.price > popularProductPrice) {
            // Store the most popular product
            popularProduct = item.id;
            popularProductPrice = item.price;
        }
    }

    var getStock = function(){
        // Retrieve and process stock information
        var url = '/assets/json/stock.json';
        return callServer(url, updateStock);
    }

    var getPrices = function(){
        // Retrieve and process price information
        var url = '/assets/json/prices.json';
        return callServer(url, updatePrices);
    }

    var getSales = function(){
        // Retrieve and process sales information
        var url = '/assets/json/sales.json';
        return callServer(url, updateSales, true);
    }

    var updateStock = function(data, status){
        // Store and process stock data
        stock = data;
        $scope.stock = stock;
        updateStockWithPrices();
    }

    var updatePrices = function(data, status){
        // We're using prices as an object with named keys so we can update them
        // individually without having to loop through an array in the editPrices function
        prices = {}
        $(data).each(function(index, element){
            prices[element.id] = element;
        });
        $scope.prices = prices;
        updateStockWithPrices();
    }

    var updateSales = function(data, status){
        // Store and process sales data
        sales = data;
        $scope.sales = sales;
        updateStockWithSales();
    }

    var updateStockWithPrices = function() {
        // Add the price to each stock item and count the total nuber of items
        if (stock && prices) {
            totalItems  = 0;
            aggregate = {};
            // Create the stock with prices variable as an array for easy
            // ordering if required
            swp = [];
            chartCategories = [];
            stockData = [];
            $(stock).each(function(index, element){
                aggregate[element.id] = element;
                totalItems+= element.count;
                // Store the item names for the chart labelling
                chartCategories.push(element.name);
                // Store the item count for chart display
                stockData.push(element.count);
            });
            $.each(prices, function(index, element){
                aggregate[element.id].price = element.price;
                swp.push(aggregate[element.id]);
            });
            $scope.swp = swp;
            $scope.totalItems = totalItems;
            $scope.chartData['stock'] = stockData;
        }
    }

    var updateStockWithSales = function() {
        /*
        Add order information to each stock item
        Calculate individual sales totals for each stock item
        Calculate the grand total sales figure
        Find the most popular product
        */
        if (sales) {
            aggregate = {};
            totalSold = 0;
            totalSales = 0;
            maxOrders = 0;
            popularProduct = '';
            popularProductPrice = 0;
            salesData = [];
            if (swp) {
                $(sales).each(function(index, element){
                    aggregate[element.id] = element;
                    totalSold+= element.orders.length;
                    checkMostPopular(element);
                });
                $(swp).each(function(index, element){
                    // Add the order information to the stock item
                    element.orders = aggregate[element.id].orders;
                    // Update the grand total sales value
                    totalSales+= element.orders.length * element.price;
                    // Store the item count for chart display
                    salesData.push((element.orders.length * element.price) / 100);
                });
            }

            // Store vars in the controller scope
            $scope.totalSold = totalSold;
            $scope.totalSales = totalSales;
            $scope.popularProduct = popularProduct;
            $scope.popularProductPrice = popularProductPrice;
            $scope.chartData['sales'] = salesData;
            // Calculate the percentage of products remaining
            $scope.remainingPercent = (Math.round(((totalItems - totalSold) / totalItems) * 1000)) / 10;
        }
    }

    var callServer = function(url, callback) {
        // Grab some JSON and pass it to the callback function for processing
        $http.get(url).success(callback);
    }

    getStock();
    getPrices();
    getSales();

    var chartOptions = {
        'stock': {
            'title': 'Starting Stock',
            'allowDecimals': false,
            'yAxisTitle': 'Stock',
            'yAxisFormat': '{value:.0f}'
        },
        'sales': {
            'title': 'Total Sales',
            'allowDecimals': true,
            'yAxisTitle': 'Sales value (£)',
            'yAxisFormat': '{value:.2f}'
        }
    }

    $scope.showChart = function($event) {
        chartType = $($event.target).attr('data-chart');
        $('#chart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: chartOptions[chartType]['title']
            },
            xAxis: {
                categories: chartCategories
            },
            yAxis: {
                allowDecimals: chartOptions[chartType]['allowDecimals'],
                title: {
                    text: chartOptions[chartType]['yAxisTitle']
                },
                labels: {
                    format: chartOptions[chartType]['yAxisFormat']
                }
            },
            series: [{
                showInLegend: false,
                data: $scope.chartData[chartType]
            }]
        });
        $('#chart-container').css('height', $(document).height() + 'px');
        $('#chart-container').fadeIn();
    }

    $scope.hideChart = function($event) {
        if ($($event.target).attr('id') == 'chart-container') {
            $('#chart-container').fadeOut();
        }
    }
});
