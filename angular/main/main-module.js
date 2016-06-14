"use strict";

var m = angular.module('wbv.main', []);
m.controller('mainCtrl', ['$scope', '$http', '$rootScope', 'Manager', 'Socket', function($scope, $http, $rootScope, Manager, Socket){
    //this.templateURL = "/angular/main/main-module.jade";

    $scope.name = "Manager Tab";
    $scope.deviceList = {};
    //$scope.bricklet = null;
    //$scope.airPressure = 0;
    //$scope.airPressureUnit = "mbar"

    Manager.emit('init');
    Manager.on('init', function(data){
        console.log("[Manager:init] data: " + data.name);
        checkDevice(data);
        //$scope.initBricklet(data['devices'][0]);
    });

    Manager.on('update', function(data){
        console.log("[Manager:init] data: " + data);
    });

    $scope.debugCheckDevices = function(){
        Manager.emit('init');
    };

    // Helper Functions
    var checkDevice = function(device){
        var key = device.name + ":" + device.uid;
        if(key in $scope.deviceList)
            console.log("Key(" + key + ") in List!!!");
        else {
            console.log("Key(" + key + ") not in List");
            //$scope.$apply(function(){
            //    $scope.deviceList[key] = device;
            //});
            $scope.deviceList[key] = device;

        }
    };

    var initBricklet = function(namespace){
        //$scope.bricklet = new Socket(namespace);
        //$scope.bricklet.emit('init');
        //
        //$scope.bricklet.on('airPressure', function(data){
        //    $scope.airPressure = data /1000.0;
        //})
    }

}]);
