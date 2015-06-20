var vending = angular.module('vending', []);

vending.controller('VendingList', function ($scope, $http) {
    var stock, prices, sales, swp, totalItems, totalSold, totalSales, maxOrders, popularProduct, popularProductPrice;

    var editPrices = function() {
        console.log('Edit the prices!!!');
    }

    var getStock = function(){
        var url = '/assets/json/stock.json';
        return callServer(url, updateStock);
    }

    var getPrices = function(){
        var url = '/assets/json/prices.json';
        return callServer(url, updatePrices);
    }

    var getSales = function(){
        var url = '/assets/json/sales.json';
        return callServer(url, updateSales);
    }

    var updateStock = function(data, status){
        stock = data;
        $scope.stock = stock;
        updateStockWithPrices();
    }

    var updatePrices = function(data, status){
        prices = data;
        $scope.prices = prices;
        updateStockWithPrices();
    }

    var updateSales = function(data, status){
        sales = data;
        $scope.sales = sales;
        updateStockWithSales();
    }

    var updateStockWithPrices = function() {
        if (stock && prices) {
            totalItems  = 0;
            aggregate = {};
            swp = [];
            $(stock).each(function(index, element){
                aggregate[element.id] = element;
                totalItems+= element.count;
            });
            $(prices).each(function(index, element){
                aggregate[element.id].price = element.price;
                swp.push(aggregate[element.id]);
            });
            $scope.swp = swp;
            $scope.totalItems = totalItems;
        }
    }

    var updateStockWithSales = function() {
        if (sales) {
            aggregate = {};
            totalSold = 0;
            totalSales = 0;
            maxOrders = 0;
            popularProduct = '';
            popularProductPrice = 0;
            if (swp) {
                $(sales).each(function(index, element){
                    aggregate[element.id] = element;
                    totalSold+= element.orders.length;
                    if (element.orders.length > maxOrders) {
                        maxOrders = element.orders.length;
                        popularProduct = element.id;
                        popularProductPrice = element.price;
                    } else if (element.orders.length == maxOrders && element.price > popularProductPrice) {
                        popularProduct = element.id;
                        popularProductPrice = element.price;
                    }
                });
                $(swp).each(function(index, element){
                    element.orders = aggregate[element.id].orders;
                    totalSales+= element.orders.length * element.price;
                });
            }

            $scope.totalSold = totalSold;
            $scope.totalSales = totalSales;
            $scope.popularProduct = popularProduct;
            $scope.popularProductPrice = popularProductPrice;
            // Calculate the percentage of products remaining
            $scope.remainingPercent = (Math.round(((totalItems - totalSold) / totalItems) * 1000)) / 10;
        }
    }

    var callServer = function(url, callback) {
        $http.get(url).success(callback);
    }

    getStock();
    getPrices();
    getSales();
});
