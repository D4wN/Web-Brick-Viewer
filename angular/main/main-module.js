"use strict";

var m = angular.module('wbv.main', []);
m.controller('mainCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){
    //this.templateURL = "/angular/main/main-module.jade";

    this.name = "Main0r";
    this.loadConnectedBricks = function(){
        console.log("Bricks loaded!");

        $rootScope.socketManager.emit('init');

        //$http.get($rootScope.serverAddress + '/api')
        //    .then(function(data) {
        //            console.log(data);
        //        }
        //        , function(err) {
        //            console.log(err);
        //        });
    };

    $rootScope.$watch('deviceList', function(){
        console.log("deviceList changed!");
        console.log($rootScope.deviceList)
    })

    //$scope.$watch(function(){
    //    return $rootScope.deviceList;
    //}, function(){
    //    console.log("deviceList changed!");
    //    console.log($rootScope.deviceList)
    //}, true);

}]);
