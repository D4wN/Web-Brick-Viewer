"use strict";

var m = angular.module('wbv.device', []);
m.controller('deviceCtrl', ['$scope', '$rootScope', function($scope, $rootScope){


    $scope.test = function(){
        console.log("uid: " + $scope.uid);
        console.log($scope.deviceInfo);
    }
    
    
    $scope.init = function(uid, deviceInfo){
        $scope.uid = uid;
        $scope.deviceInfo = deviceInfo;

        // console.log("uid: " + uid + "\ndeviceInfo: " + deviceInfo + "\n");
        // $scope.name = device['deviceIdentifier'];
    }
}]);