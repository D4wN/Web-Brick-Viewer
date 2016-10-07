"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickletBarometerExtended', ['$log', '$http', '$timeout', 'Graph', 'GraphConfig', function($log, $http, $timeout, Graph, GraphConfig){
    function BrickletBarometerExtended(){
        this.debug_name = "[BrickletBarometerExtended]";
        this.viewPath = "/extendedViews/brickletBarometerExtendedView";   //PAth on Server to the jade file
    }

    BrickletBarometerExtended.prototype.getController = function(){
        return ['$scope', '$log', function($scope, $log){
            let debug_name = "[brickletBarometerExtended|" + $scope.uid + "]";

            //Init Graph
            $scope.graphAirPressure = new Graph($scope.uid + "-flot-airpressure", $scope.device, [new GraphConfig($scope.deviceInfo.deviceSpec.values[0].name, $scope.deviceInfo.deviceSpec.values[0], 1000)], 50);
            $scope.graphAltitude = new Graph($scope.uid + "-flot-altitude", $scope.device, [new GraphConfig($scope.deviceInfo.deviceSpec.values[1].name, $scope.deviceInfo.deviceSpec.values[1], 1, "#279fa5")], 50);

            $scope.graphAirPressure.start();
            $scope.graphAltitude.start();

            //Init Option
            $scope.referenceAirPressure = 1013.25;//mbar/1000 - default value; Valid values are between 10000 and 1200000
            $scope.btnGetReferenceAirPressure = false;
            $scope.getReferenceAirPressure = function(){
                $log.log(debug_name + "getReferenceAirPressure()");

                $scope.btnGetReferenceAirPressure = true;

                $scope.device.getReferenceAirPressure(function(value){
                    // $log.log(debug_name + "getReferenceAirPressure() = " + value/1000);
                    $scope.referenceAirPressure = value / 1000.0;
                    $scope.btnGetReferenceAirPressure = false;
                }, function(err){
                    $log.warn(debug_name + "getReferenceAirPressure() Error: " + err);
                    $scope.btnGetReferenceAirPressure = false;
                });
            };
            $scope.getReferenceAirPressure();
            $scope.btnSetReferenceAirPressure = false;
            $scope.setReferenceAirPressure = function(){
                $log.log(debug_name + "setReferenceAirPressure(" + $scope.referenceAirPressure * 1000 + ")");

                $scope.btnSetReferenceAirPressure = true;
                $scope.device.setReferenceAirPressure($scope.referenceAirPressure * 1000);
                $timeout(function(){ //dont spam the SET Button fix
                    $scope.btnSetReferenceAirPressure = false;
                }, 1000);
                // FIXME Callbacks undefined in Tinkerforge API
                //     , function(){
                //     $log.log(debug_name + "setReferenceAirPressure() = success");
                //     $scope.btnSetReferenceAirPressure = false;
                // }, function(err){
                //     $log.warn(debug_name + "setReferenceAirPressure() Error: " + err);
                //     $scope.btnSetReferenceAirPressure = false;
                // });
            };

            //The default values are 10 for the normal averages and 25 for the moving average.
            //The maximum length for the pressure average is 10, for the temperature average is 255 and for the moving average is 25.
            $scope.airPressureMovingAverageLength = 25;
            $scope.airPressureAverageLength = 10;
            $scope.temperateAverageLength = 10;

            $scope.getAveraging = function(){
                $log.log(debug_name + "getAveraging()");
                $scope.device.getAveraging(function(movingAveragePressure, averagePressure, averageTemperature){
                    // $log.log(debug_name + "getAveraging() - Callback");
                    $scope.airPressureMovingAverageLength = movingAveragePressure;
                    $scope.airPressureAverageLength = averagePressure;
                    $scope.temperateAverageLength = averageTemperature;

                }, function(err){
                    $log.warn(debug_name + "getAveraging() - Error: " + err);
                })

            };
            $scope.getAveraging();

            $scope.setAveraging = function(){
                //TF API: Callback: undefined
                // $log.log(debug_name + "setAveraging(" + $scope.airPressureMovingAverageLength + ", " + $scope.airPressureAverageLength + ", " + $scope.temperateAverageLength + ")");
                $scope.device.setAveraging($scope.airPressureMovingAverageLength, $scope.airPressureAverageLength, $scope.temperateAverageLength);
            };


            $scope.$on("$destroy", function(){
                if($scope.graphAirPressure){
                    $scope.graphAirPressure.stop();
                }
                if($scope.graphAltitude){
                    $scope.graphAltitude.stop();
                }
            });


        }];
    }

    return new BrickletBarometerExtended;
}]);