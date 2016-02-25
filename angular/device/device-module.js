"use strict";

var m = angular.module('wbv.device', []);
m.controller('deviceCtrl', ['$scope', '$rootScope', 'Manager', 'Socket', function($scope, $rootScope, Manager, Socket){
    //$scope.name = "device?";
    //$scope.device = null;

    $scope.init = function(namespace, device){
        $scope.namespace = namespace;
        $scope.device = device;
        $scope.name = device['deviceIdentifier'];
    }
}]);