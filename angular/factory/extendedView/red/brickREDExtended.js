"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickREDExtended', ['$log', '$http', function($log, $http){
    function BrickREDExtended(){
        this.debug_name = "[BrickREDExtended]";
        this.viewPath = "/extendedViews/RED/brickREDExtendedView";   //Path on Server to the jade file
    }

    BrickREDExtended.prototype.getController = function(){
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[BrickREDExtended|" + $scope.uid + "]";
            $scope.viewName = "BrickREDExtended"; //just for test purpose

            $log.log(debug_name + " is here!");
        }];
    }


    return new BrickREDExtended;
}]);