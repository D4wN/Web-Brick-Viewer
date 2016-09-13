"use strict";

var angApp = angular.module('wbv');

angApp.factory('TF', ['$log', 'WBVUtils', 'SpecialDeviceInjector', function($log, WBVUtils, SpecialDeviceInjector){
    function TF(){
        this.debug_name = "[TinkerForge Factory]";
        this.ipcon = null;
        this.Tinkerforge = Tinkerforge;
        this.deviceList = this.getDeviceList(); //id:name
        this.deviceClassList = this.getDeviceList(true);

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

    TF.prototype.getDeviceList = function(className = false){
        $log.log(this.debug_name + " getDeviceList(className=" + className + ")");
        let list = {}; //name:id
        for(let name in this.Tinkerforge){
            let tmp = this.Tinkerforge[name];
            if(className){
                if(WBVUtils.checkKey(tmp, 'DEVICE_IDENTIFIER') && WBVUtils.checkKey(tmp, 'name')){
                    list[tmp['DEVICE_IDENTIFIER']] = tmp.name;
                }
            } else {
                if(WBVUtils.checkKey(tmp, 'DEVICE_IDENTIFIER') && WBVUtils.checkKey(tmp, 'DEVICE_DISPLAY_NAME')){
                    list[tmp['DEVICE_IDENTIFIER']] = tmp['DEVICE_DISPLAY_NAME'];
                }
            }

        }

        // $log.log(this.Tinkerforge['BrickDC']['DEVICE_DISPLAY_NAME']);
        return list;
    }

    TF.prototype.getDeviceName = function(deviceIdentifier){
        if(!WBVUtils.checkKey(this.deviceList, deviceIdentifier)) return "Unknown Device";
        return this.deviceList[deviceIdentifier];
    }

    TF.prototype.getDeviceClassName = function(deviceIdentifier){

        if(!WBVUtils.checkKey(this.deviceClassList, deviceIdentifier)) return null;
        return this.deviceClassList[deviceIdentifier];
    }

    TF.prototype.getDeviceImpl = function(className, uid){
        let device = new this.Tinkerforge[className](uid, this.ipcon);
        device.CLASS_NAME = className;
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
        this.deviceClassName = TF.getDeviceClassName(deviceIdentifier);
        this.deviceSpec = DeviceSpecs.getDeviceSpec(null, this.deviceIdentifier);
    }

    return DeviceInformation;
}]);