"use strict";

var angApp = angular.module('wbv');

angApp.factory('DeviceSpecs', ['$log', '$http', 'TF', function($log, $http, TF){
    function DeviceSpecs(){
        this.debug_name = "[DeviceSpecs]";

        this.deviceData = null;
        var that = this;
        this.getDeviceSpecDataFromJSON();

    }

    DeviceSpecs.prototype.getDeviceSpecDataFromJSON = function(url = '/js/deviceSpecs.json'){
        let debug_name = this.debug_name;
        let that = this;

        $http.get(url).then(function(data){
            $log.log(debug_name + " Got Data");
            // $log.log(data.data);
            //TODO check for response codes!
            that.deviceData = data.data;
            that.validateDeviceSpec();

        }, function(err){
            $log.error(debug_name + " Got Error");
            $log.log(err);

            that.deviceData = null;
        });
    };

    DeviceSpecs.prototype.getDeviceSpec = function(deviceName = null, deviceIdentifier = null){
        if(deviceName === null){
            if(deviceIdentifier === null) return;
            deviceName = TF.getDeviceName(deviceIdentifier);
            // $log.log(this.debug_name + "getDeviceSpec() ID(" + deviceIdentifier + ") to Name got = " + deviceName);

            if(deviceName === null){
                $log.warn(this.debug_name + " getDeviceSpec() No Name was found for ID(" + deviceIdentifier + ")");
                return null
            }
        }

        if(this.deviceData === null){
            $log.error(this.debug_name + " getDeviceSpec() -> this.deviceData was Null! Retry the http request!");
            return null;
        }

        if(this.deviceData.hasOwnProperty(deviceName)){
            // $log.log(this.debug_name + "getDeviceSpec() found somthing with the Name = " + deviceName);
            return this.deviceData[deviceName];
        } else {
            $log.warn(this.debug_name + " getDeviceSpec() deviceName = " + deviceName + " not found in DeviceSpecs.");
            return null;
        }
    };

    DeviceSpecs.prototype.validateDeviceSpec = function(){
        $log.log(this.debug_name + " validateDeviceSpec()");
        let list = {}; //name:id
        let checkKey = function(object, key){
            return object.hasOwnProperty(key);
        };

        $log.log(TF.Tinkerforge);
        // $log.log(this.deviceData);

        for(let name in this.deviceData){
            let dev = this.deviceData[name];
            let gotError = false; // If the Entry has some errors, delete the Entry from the Data!!!

            //Check Class(has)
            if(!checkKey(dev, 'class')){
                $log.warn(name + " missing Key['class']");
                gotError = true;

            } else {
                //Check Class(Function in Tinkerforge)
                if(!checkKey(TF.Tinkerforge, dev['class'])){
                    $log.warn(name + " missing Class('" + dev['class'] + "') in Tinkerforge Bindings - Could be an unreleased Brick/Bricklet!");
                    gotError = true;
                }
            }
            //Check each Value
            if(!checkKey(dev, 'values')){
                $log.warn(name + " missing Key['values']");
                gotError = true;

            } else {
                let values = dev['values'];
                for(let i = 0; i < values.length; i++){
                    //Check Name(has)
                    if(!checkKey(values[i], 'name')){
                        $log.warn(name + " missing Key('" + i + "')['name'] in ['values']")
                        gotError = true;
                    }
                    //Check Subvalues(has)
                    if(!checkKey(values[i], 'subvalues')){
                        $log.warn(name + " missing Key('" + i + "')['subvalues'] in ['values']")
                        gotError = true;
                    }
                    //Check unit(has)
                    if(!checkKey(values[i], 'unit')){
                        $log.warn(name + " missing Key('" + i + "')['unit'] in ['values']")
                        gotError = true;
                    }
                    //Check args(has)
                    if(!checkKey(values[i], 'args')){
                        $log.warn(name + " missing Key('" + i + "')['args'] in ['values']")
                        gotError = true;
                    }
                    //Check advanced(has) FIXME NYI - is used for Options
                    if(!checkKey(values[i], 'advanced')){
                        $log.warn(name + " missing Key('" + i + "')['advanced'] in ['values']")
                        gotError = true;
                    }

                    //Check Getter(has)
                    if(!checkKey(values[i], 'getter')){
                        $log.warn(name + " missing Key('" + i + "')['getter'] in ['values']")
                        gotError = true;
                    }
                    //TODO Check Getter(Function in Tinkerforge) in SpecialDeviceInjector?
                }
            }

            //If there was some kind of missing Entry -> Delete Entry from the current deviceSpec Data!
            if(gotError){
                $log.warn("Removed Device(" + name + ") from current DeviceSpec Data, because of missing Entries.");
                delete this.deviceData[name];
            }
        }
        // $log.log(this.deviceData);
    };

    return new DeviceSpecs;
}]);

