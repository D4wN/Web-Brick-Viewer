"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickletBarometerExtended', ['$log', '$http', function($log, $http){
    function BrickletBarometerExtended(){
        this.debug_name = "[BrickletBarometerExtended]";
        this.viewPath = "/extendedViews/brickletBarometerExtendedView";   //PAth on Server to the jade file
    }

    BrickletBarometerExtended.prototype.getController = function(){ 
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[brickletBarometerExtended|" + $scope.uid + "]";
            $scope.viewName = "brickletBarometerExtended"; //just for test purpose

            $log.log(debug_name + " is here!");
        }];
    }


    return new BrickletBarometerExtended;
}]);