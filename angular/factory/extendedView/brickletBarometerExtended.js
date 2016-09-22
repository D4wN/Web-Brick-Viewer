"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickletBarometerExtended', ['$log', '$http', '$timeout', 'Graph', function($log, $http, $timeout, Graph){
    function BrickletBarometerExtended(){
        this.debug_name = "[BrickletBarometerExtended]";
        this.viewPath = "/extendedViews/brickletBarometerExtendedView";   //PAth on Server to the jade file
    }

    BrickletBarometerExtended.prototype.getController = function(){
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[brickletBarometerExtended|" + $scope.uid + "]";
            $scope.viewName = "brickletBarometerExtended"; //just for test purpose

            $log.log(debug_name + " is here!");

            $scope.graph = new Graph($scope.uid + "-flot-airpressure", $scope.deviceInfo.deviceSpec.values[0], $scope.device, 50, 1000, "Air Pressure");
            $scope.graph.start();

            $scope.$on("$destroy", function(){
                if($scope.graph){
                    $scope.graph.stop();
                }
            });


        }];
    }

    return new BrickletBarometerExtended;
}]);