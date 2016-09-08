"use strict";

var angApp = angular.module('wbv');

angApp.factory('SpecialDeviceInjector', ['$log', 'WBVUtils', 'SpecialBrickletGPS', 'SpecialBrickletColor', function($log, WBVUtils, SpecialBrickletGPS, SpecialBrickletColor){
    function SpecialDeviceInjector(){
        this.debug_name = "[SpecialDeviceInjector]";

        this.specialDeviceList = {};
        this.specialDeviceList[Tinkerforge.BrickletGPS.name] = SpecialBrickletGPS;
        this.specialDeviceList[Tinkerforge.BrickletColor.name] = SpecialBrickletColor;

        // $log.log(this.specialDeviceList);
    }

    SpecialDeviceInjector.prototype.injectFunctions = function(deviceObject, TF){
        //check if it is in list
        if(WBVUtils.checkKey(this.specialDeviceList, deviceObject.CLASS_NAME)){
            //yes: inject functions
            $log.log(this.debug_name + "injectFunctions(" + deviceObject.CLASS_NAME + ")");
            this.specialDeviceList[deviceObject.CLASS_NAME].inject(deviceObject, TF);
        }
        //no: do nothing nothing to inject
    }

    return new SpecialDeviceInjector;
}]);