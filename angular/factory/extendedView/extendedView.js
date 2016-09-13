"use strict";

var angApp = angular.module('wbv');

angApp.factory('ExtendedView', ['$log', 'WBVUtils', 'BrickletBarometerExtended', 'BrickREDExtended', function($log, WBVUtils, BrickletBarometerExtended, BrickREDExtended){
    function ExtendedView(){
        this.debug_name = "[ExtendedView]";

        this.extendedViewDeviceList = {};
        this.extendedViewDeviceList[Tinkerforge.BrickletBarometer.name] = BrickletBarometerExtended;
        this.extendedViewDeviceList[Tinkerforge.BrickRED.name] = BrickREDExtended;

    }

    ExtendedView.prototype.getExtendedView = function(className){
        if(className == null || className == undefined){
            return null;
        }

        if(WBVUtils.checkKey(this.extendedViewDeviceList, className)){
            $log.log(this.debug_name + "getExtendedView(" + className + ")");
            return this.extendedViewDeviceList[className]
        }
        return null;
    }


    return new ExtendedView;
}]);