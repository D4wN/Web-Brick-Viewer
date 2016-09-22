"use strict";

var m = angular.module('wbv.deviceValue', []);
m.controller('valueCtrl', ['$scope', '$log', 'PollingValueTimer', 'WBVUtils', function($scope, $log, PollingValueTimer, WBVUtils){
    let debug_name = "[ValueCtrl-" + $scope.val['name'] + "]";

    let convertUnitData = function(){
        // $log.log(debug_name + ".convertUnitData()");
        if(angular.isArray($scope.val['unit'])){
            $scope.val['unitAddition'] = [];
            for(let i = 0; i < $scope.val['unit'].length; i++){
                $scope.val['unitAddition'][i] = WBVUtils.getUnitData($scope.val['unit'][i]);
            }
        } else {
            $scope.val['unitAddition'] = WBVUtils.getUnitData($scope.val['unit']);
        }
    }
    convertUnitData();
    $scope.timer = new PollingValueTimer(1000, $scope.val['getter'], $scope.device, $scope.val['args']);
    $scope.timer.start();

    $scope.$on("$destroy", function(){
        if($scope.timer){
            $scope.timer.stop();
        }
    });

}]);