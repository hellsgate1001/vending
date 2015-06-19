var vending = angular.module('vending', []);

vending.controller('VendingList', function ($scope, $http) {
    var stock, prices, sales, swp;

    var getStock = function(){
        var url = '/assets/json/stock.json'
        return callServer(url, updateStock);
    }

    var getPrices = function(){
        var url = '/assets/json/prices.json'
        return callServer(url, updatePrices);
    }

    var updateStock = function(data, status){
        stock = data;
        $scope.stock = stock;
        updateStockWithPrices();
    };

    var updatePrices = function(data, status){
        prices = data;
        $scope.prices = prices;
        updateStockWithPrices();
    };

    var updateStockWithPrices = function() {
        if (stock && prices) {
            aggregate = {};
            swp = [];
            $(stock).each(function(index, element){
                aggregate[element.id] = element;
            });
            $(prices).each(function(index, element){
                aggregate[element.id].price = element.price;
                swp.push(aggregate[element.id]);
            });
            $scope.swp = swp;
        }
    }

    var callServer = function(url, callback) {
        $http.get(url).success(callback);
    }

    getStock();
    getPrices();
});
