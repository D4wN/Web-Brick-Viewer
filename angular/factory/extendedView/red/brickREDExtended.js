"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickREDExtended', ['$log', 'TF', function($log, TF){
    function BrickREDExtended(){
        this.debug_name = "[BrickREDExtended]";
        // this.viewPath = "/extendedViews/RED/brickREDExtendedView";   //Path on Server to the jade file - deprecated!
        this.viewName = "brickREDExtendedView"                      //Solution for only Client
    }

    BrickREDExtended.prototype.getController = function(){
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[BrickREDExtended|" + $scope.uid + "]";


            $log.log(debug_name + " is here!");
            $log.log($scope.deviceInfo);

            $scope.device = TF.getDeviceImpl($scope.deviceInfo.deviceClassName, $scope.uid);
            $log.log($scope.device);


            //Add Submenus to navigation
            // let submenuConfig = [
            //     {
            //         name: "Overview",
            //         target: $scope.uid
            //     }, {
            //         name: "Program",
            //         target: $scope.uid+"-redbrick-program"
            //     }, {//TODO delete debug entries
            //
            //         target: "missing Name"
            //     }, {
            //         name: "missing target"
            //     }
            // ]
            // $scope.addNavigationSubmenu($scope.uid, submenuConfig);

        }];
    }


    return new BrickREDExtended;
}]);