"use strict";

var angApp = angular.module('wbv');

angApp.factory('SpecialDeviceInjector', ['$log', 'WBVUtils', 'SpecialBrickletGPS', 'SpecialBrickletColor', function($log, WBVUtils, SpecialBrickletGPS, SpecialBrickletColor){
    function SpecialDeviceInjector(){
        this.debug_name = "[SpecialDeviceInjector]";

        this.specialDeviceList = {};
        this.specialDeviceList[Tinkerforge.BrickletGPS.DEVICE_DISPLAY_NAME] = SpecialBrickletGPS;
        this.specialDeviceList[Tinkerforge.BrickletColor.DEVICE_DISPLAY_NAME] = SpecialBrickletColor;

    }

    SpecialDeviceInjector.prototype.injectFunctions = function(deviceObject, TF){
        let deviceName = deviceObject.constructor.DEVICE_DISPLAY_NAME;
        //check if it is in list
        if(WBVUtils.checkKey(this.specialDeviceList, deviceName)){
            //yes: inject functions
            $log.log(this.debug_name + "injectFunctions(" + deviceName + ")");
            this.specialDeviceList[deviceName].inject(deviceObject, TF);
        }
        //no: do nothing nothing to inject
    }

    return new SpecialDeviceInjector;
}]);