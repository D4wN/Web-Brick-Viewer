"use strict";

var angApp = angular.module('wbv');

angApp.factory('TF', ['$log', 'SpecialDeviceInjector', function($log, SpecialDeviceInjector){
    function TF(){
        this.debug_name = "[TinkerForge Factory]";
        this.ipcon = null;
        this.Tinkerforge = Tinkerforge;
        this.deviceList = this.createDeviceList(); //id:name
    }

    //TODO write better error messages
    TF.prototype.getErrorDescription = function(errCode){
        switch(errCode){
            case this.Tinkerforge.IPConnection.ERROR_ALREADY_CONNECTED:
                return "IPConnection.ERROR_ALREADY_CONNECTED = 11";
            case this.Tinkerforge.IPConnection.ERROR_NOT_CONNECTED:
                return "IPConnection.ERROR_NOT_CONNECTED = 12";
            case this.Tinkerforge.IPConnection.ERROR_CONNECT_FAILED:
                return "IPConnection.ERROR_CONNECT_FAILED = 13";
            case this.Tinkerforge.IPConnection.ERROR_INVALID_FUNCTION_ID:
                return "IPConnection.ERROR_INVALID_FUNCTION_ID = 21";
            case this.Tinkerforge.IPConnection.ERROR_TIMEOUT:
                return "IPConnection.ERROR_TIMEOUT = 31";
            case this.Tinkerforge.IPConnection.ERROR_INVALID_PARAMETER:
                return "IPConnection.ERROR_INVALID_PARAMETER = 41";
            case this.Tinkerforge.IPConnection.ERROR_FUNCTION_NOT_SUPPORTED:
                return "IPConnection.ERROR_FUNCTION_NOT_SUPPORTED = 42";
            case this.Tinkerforge.IPConnection.ERROR_UNKNOWN_ERROR:
                return "IPConnection.ERROR_UNKNOWN_ERROR = 43";
            default:
                return errCode;
        }
    }

    // IPConnection.ERROR_ALREADY_CONNECTED = 11
    // IPConnection.ERROR_NOT_CONNECTED = 12
    // IPConnection.ERROR_CONNECT_FAILED = 13
    // IPConnection.ERROR_INVALID_FUNCTION_ID = 21
    // IPConnection.ERROR_TIMEOUT = 31
    // IPConnection.ERROR_INVALID_PARAMETER = 41
    // IPConnection.ERROR_FUNCTION_NOT_SUPPORTED = 42
    // IPConnection.ERROR_UNKNOWN_ERROR = 43

    TF.prototype.createDeviceList = function(){
        $log.log(this.debug_name + " getDeviceList()");
        let list = {}; //name:id
        for(let name in this.Tinkerforge){
            let tmp = this.Tinkerforge[name];
            if(tmp.hasOwnProperty('DEVICE_DISPLAY_NAME') && tmp.hasOwnProperty('DEVICE_IDENTIFIER')){
                list[tmp['DEVICE_IDENTIFIER']] = tmp['DEVICE_DISPLAY_NAME'];
            }
        }

        // $log.log(this.Tinkerforge['BrickDC']['DEVICE_DISPLAY_NAME']);
        return list;
    }

    TF.prototype.getDeviceName = function(deviceIdentifier){
        if(!this.deviceList.hasOwnProperty(deviceIdentifier)) return "Unknown Device";
        return this.deviceList[deviceIdentifier];
    }

    TF.prototype.getDeviceImpl = function(className, uid){
        // $log.log(this.Tinkerforge);
        // $log.log(className);
        let device = new this.Tinkerforge[className](uid, this.ipcon);
        SpecialDeviceInjector.injectFunctions(device, this);
        return device;
    }


    return new TF;
}]);

angApp.factory('DeviceInformation', ['$log', 'TF', 'DeviceSpecs', function($log, TF, DeviceSpecs){
    function DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier){
        this.uid = uid;
        this.connectedUid = connectedUid;
        this.position = position;
        this.hardwareVersion = hardwareVersion;
        this.firmwareVersion = firmwareVersion;
        this.deviceIdentifier = deviceIdentifier;
        this.deviceDisplayName = TF.getDeviceName(deviceIdentifier);
        this.deviceSpec = DeviceSpecs.getDeviceSpec(null, this.deviceIdentifier);
    }

    return DeviceInformation;
}]);