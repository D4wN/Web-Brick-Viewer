"use strict";

var WBVProviders = {}; //used to dynamically load controllers
var angApp = angular.module('wbv', ['wbv.main', 'wbv.device', 'wbv.deviceValue'], function($controllerProvider){
    WBVProviders = {
        $controllerProvider: $controllerProvider
    };
});
// angApp.value('WBVProviders', providers);

angApp.run(function($rootScope){
    //TODO better way to get REST IP?
    // $rootScope.serverAddress = 'http://' + location.host;
});

angApp.config(['$httpProvider', '$logProvider', function($httpProvider, $logProvider) {
    //http://stackoverflow.com/questions/24134117/no-access-control-allow-origin-header-is-present-on-the-requested-resource-an
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

    //TODO Disable Logging
    $logProvider.debugEnabled(true);
}]);

console.log("[APP]Angular working!");