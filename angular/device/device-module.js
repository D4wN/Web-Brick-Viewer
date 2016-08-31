"use strict";

var m = angular.module('wbv.device', []);
m.controller('deviceCtrl', ['$scope', '$log', 'TF', function($scope, $log, TF){
    let debug_name = "[DeviceCtrl-" + $scope.uid + "]";

    if($scope.deviceInfo.deviceSpec != null){
        $scope.device = TF.getDeviceImpl($scope.deviceInfo.deviceSpec['class'], $scope.uid);
    }
    
    
    


    $scope.test = function(){

        // if($scope.timer[0].session == null){
        //     $scope.timer[0].start();
        // } else {
        //     $scope.timer[0].stop();
        // }
    }


}]);