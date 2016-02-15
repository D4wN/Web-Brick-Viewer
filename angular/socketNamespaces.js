"use strict";

var managerNamespaceInit = function($rootScope){
    $rootScope.socketManager = io('/manager');
    $rootScope.socketManager.on('init', function(data){
        console.log("[Manager]Data:");

        //$rootScope.deviceList = []; //for more perfomance http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
        var list = [];
        for(var i = 0; i < data.devices.length; i++){
            list.push(data.devices[i]);
        }
        $rootScope.deviceList = list; //to trigger the watcher

        console.log($rootScope.deviceList);
    });
}

//var a = ["a", "b", "c"];
//a.forEach(function(entry) {
//    console.log(entry);
//});