"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickletBarometerExtended', ['$log', '$http', '$timeout', 'Graph', 'GraphConfig', function($log, $http, $timeout, Graph, GraphConfig){
    function BrickletBarometerExtended(){
        this.debug_name = "[BrickletBarometerExtended]";
        this.viewPath = "/extendedViews/brickletBarometerExtendedView";   //PAth on Server to the jade file
    }

    BrickletBarometerExtended.prototype.getController = function(){
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[brickletBarometerExtended|" + $scope.uid + "]";
            $scope.viewName = "brickletBarometerExtended"; //just for test purpose

            $log.log(debug_name + " is here!");

            // $log.log($scope.deviceInfo.deviceSpec);

            let graphConfigs = [];
            graphConfigs.push(new GraphConfig($scope.deviceInfo.deviceSpec.values[0].name, $scope.deviceInfo.deviceSpec.values[0], 1000));
            // graphConfigs.push(new GraphConfig($scope.deviceInfo.deviceSpec.values[0].name+" 2", $scope.deviceInfo.deviceSpec.values[0], 999.99999, "#32da27"));
            graphConfigs.push(new GraphConfig($scope.deviceInfo.deviceSpec.values[1].name, $scope.deviceInfo.deviceSpec.values[1], 1, "#279fa5"));

            // $scope.graph = new Graph($scope.uid + "-flot-airpressure", $scope.deviceInfo.deviceSpec.values[0], $scope.device, 50, 1000, "Air Pressure");
            $scope.graph = new Graph($scope.uid + "-flot-airpressure", $scope.device, graphConfigs, 50);
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