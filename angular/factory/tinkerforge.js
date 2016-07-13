"use strict";

var angApp = angular.module('wbv');

angApp.factory('TF', ['$rootScope', function($rootScope) {
    function TF() {
        this.name = "TinkerForge Object";
        this.ipcon = null;
        this.Tinkerforge = Tinkerforge;
    }

    TF.prototype.setName = function(newName) {
        this.name = newName;
    };

    TF.prototype.printThis = function() {
        console.log("Hallo Welt");
    };

    return new TF;
}]);

angApp.factory('DeviceInformation', ['$rootScope', function($rootScope) {
    function DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier) {
        this.uid = uid;
        this.connectedUid = connectedUid;
        this.position = position;
        this.hardwareVersion = hardwareVersion;
        this.firmwareVersion = firmwareVersion;
        this.deviceIdentifier = deviceIdentifier;
    }

    return DeviceInformation;
}]);

// function DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier) {
//     this.uid = uid;
//     this.connectedUid = connectedUid;
//     this.position = position;
//     this.hardwareVersion = hardwareVersion;
//     this.firmwareVersion = firmwareVersion;
//     this.deviceIdentifier = deviceIdentifier;
// }