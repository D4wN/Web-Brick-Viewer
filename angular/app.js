"use strict";

var angApp = angular.module('wbv', ['wbv.main']);

angApp.run(function($rootScope){
    //TODO better way to get REST IP?
    $rootScope.serverAddress = 'http://' + location.host;
    //Connected TF Device List
    $rootScope.deviceList = [];
    //console.log($rootScope.serverAddress);
    //Socket.io
    //$rootScope.socket = io();
    managerNamespaceInit($rootScope);
});

angApp.config(['$httpProvider', function($httpProvider) {
    //http://stackoverflow.com/questions/24134117/no-access-control-allow-origin-header-is-present-on-the-requested-resource-an
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";


}]);

console.log("Angular working!");