"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickREDExtended', ['$log', 'TF', function($log, TF){
    function BrickREDExtended(){
        this.debug_name = "[BrickREDExtended]";
        this.viewPath = "/extendedViews/RED/brickREDExtendedView";   //Path on Server to the jade file
    }

    BrickREDExtended.prototype.getController = function(){
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[BrickREDExtended|" + $scope.uid + "]";
            $scope.viewName = "BrickREDExtended"; //just for test purpose

            $log.log(debug_name + " is here!");
            $log.log($scope.deviceInfo);

            $scope.device = TF.getDeviceImpl($scope.deviceInfo.deviceClassName, $scope.uid);
            $log.log($scope.device);
        }];
    }


    return new BrickREDExtended;
}]);