"use strict";

var angApp = angular.module('wbv');

angApp.factory('SpecialDeviceInjector', ['$log', 'SpecialBrickletGPS', function($log, SpecialBrickletGPS){
    function SpecialDeviceInjector(){
        this.debug_name = "[SpecialDeviceInjector]";

        this.specialDeviceList = {};
        this.specialDeviceList[Tinkerforge.BrickletBarometer.DEVICE_DISPLAY_NAME] = SpecialBrickletGPS  //TODO change to BrickletGPS

        this.checkKey = function(object, key){
            return object.hasOwnProperty(key);
        };

        // $log.log(this.specialDeviceList);
    }

    SpecialDeviceInjector.prototype.injectFunctions = function(deviceObject){
        let deviceName = deviceObject.constructor.DEVICE_DISPLAY_NAME;
        //check if it is in list
        if(this.checkKey(this.specialDeviceList, deviceName)){
            //yes: inject functions
            $log.log(this.debug_name + "injectFunctions(" + deviceName + ")");
            this.specialDeviceList[deviceName].inject(deviceObject);
        }
        //no: do nothing nothing to inject
    }

    return new SpecialDeviceInjector;
}]);