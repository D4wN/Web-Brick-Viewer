"use strict";

var m = angular.module('wbv.device', []);
m.controller('deviceCtrl', ['$scope', '$log', 'ExtendedView', 'TF', function($scope, $log, ExtendedView, TF){
    let debug_name = "[DeviceCtrl-" + $scope.uid + "]";
    $scope.extendedView = null;

    //Toggle visibility of simple view
    $scope.showSimpleView = true;
    $scope.btnShowSimpleViewText = "Hide Simple View";
    $scope.btnShowSimpleView = function(){
        if($scope.showSimpleView){
            $scope.showSimpleView = false;
            $scope.btnShowSimpleViewText = "Show Simple View";
        } else {
            $scope.showSimpleView = true;
            $scope.btnShowSimpleViewText = "Hide Simple View";
        }
    }

    //Toggle visibility of extended view
    $scope.showExtendedView = true;
    $scope.btnShowExtendedViewText = "Hide Extended View";
    $scope.btnShowExtendedView = function(){
        if($scope.showExtendedView){
            $scope.showExtendedView = false;
            $scope.btnShowExtendedViewText = "Show Extended View";
        } else {
            $scope.showExtendedView = true;
            $scope.btnShowExtendedViewText = "Hide Extended View";
        }
    }
    
    $scope.btnLoadExtendedView = function(){
        $scope.btnLoadExtendedView = null;
    }

    //Check for simpleView and Device Specs
    if($scope.deviceInfo.deviceSpec != null){
        $scope.device = TF.getDeviceImpl($scope.deviceInfo.deviceSpec['class'], $scope.uid);

    }
    
    //Check Extended View
    let checkExtendedView = function(){
        let className = $scope.deviceInfo.deviceClassName;
        $scope.extendedView = ExtendedView.getExtendedView(className);
        if($scope.extendedView == null)
            return;
        
        $scope.pathToView = $scope.extendedView.viewPath;
        WBVProviders.$controllerProvider.register($scope.deviceInfo.deviceClassName + "Ctrl", $scope.extendedView.getController());
    }

    checkExtendedView();

}]);