"use strict";

var Tinkerforge = require('tinkerforge');
var io = require('../scripts/socket.io.js');
var lgr = new (require('./simpleLogger'))("Tinkerforge");

var tfPORT = process.env.TFPORT || 4223;
var tfHOST = 'localhost'; //TODO is it always localhost?!
var ipcon = new Tinkerforge.IPConnection();
var isIpconConnected = false;
var ipconConnectFunc = function(){ lgr.logErr("ipconConnectFunc not set!")}
var ipconDisconnectFunc = function(){ lgr.logErr("ipconDisconnectFunc not set!")}

var deviceIdentifierToObject = {}   //Key: DeviceIdentifier   Value: DeviceObject
var currentConnectedDivices_callback = null;

var socketServer = null; //for socket.io

// Connect to brickd

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
        isIpconConnected = true;
        lgr.log("IPCON connected");
        createDeviceIdentifierToObject();
        //ipcon.enumerate();
        io.init(socketServer);
    }
);


var createDeviceIdentifierToObject = function(){
    var keys = Object.keys(Tinkerforge);
    for(var i = 0; i < keys.length; i++){
        var device = Tinkerforge[keys[i]];
        if(device.name === undefined) continue;
        deviceIdentifierToObject[device.DEVICE_IDENTIFIER] = device;
        //lgr.log(i + ":" + device.DEVICE_DISPLAY_NAME + ":" + device.DEVICE_IDENTIFIER);
    }
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_ENUMERATE,
    function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier, enumerationType){

        if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_DISCONNECTED) {
            //lgr.log('DISCONNCECTED: ' + uid + "  " + deviceIdentifier ); //no identifier(is always 0)
            ipconDisconnectFunc(uid);
            return;

        }

        //lgr.log('Connected UID:     '+connectedUid);
        //lgr.log('Position:          '+position);
        //lgr.log('Hardware Version:  '+hardwareVersion);
        //lgr.log('Firmware Version:  '+firmwareVersion);
        //lgr.log('Device Identifier: '+deviceIdentifier);
        //lgr.log('Device Display Name: '+deviceIdentifierToObject[deviceIdentifier].DEVICE_DISPLAY_NAME);
        //lgr.log('Device Name: '+deviceIdentifierToObject[deviceIdentifier].name);
        //lgr.log('');
        var device = {};
        device['uid'] = uid;
        device['deviceDisplayName'] = deviceIdentifierToObject[deviceIdentifier].DEVICE_DISPLAY_NAME;
        device['deviceIdentifier'] = deviceIdentifier;
        device['name'] = deviceIdentifierToObject[deviceIdentifier].name;
        // Additional Content
        device['position'] = position;
        device['connectedUid'] = connectedUid;
        device['hardwareVersion'] = hardwareVersion;
        device['firmwareVersion'] = firmwareVersion;
        // Parameter(Get/Set)
        device['parameter'] = {}; //TODO how to get all parameters?

        if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_CONNECTED) {
            //lgr.log('CONNECTED: ' + deviceIdentifierToObject[deviceIdentifier].name);
            ipconConnectFunc(deviceIdentifierToObject[deviceIdentifier].name+":"+uid, device);
            return;
        }

        if(currentConnectedDivices_callback != null){
            currentConnectedDivices_callback(device);
        }
    }
);

module.exports.init = function(server){
    socketServer = server;
    ipcon.connect(tfHOST, tfPORT,
        function(error){
            lgr.logErr('Error: ' + error);
        }
    );
}

module.exports.initDevice = function(deviceName, uid){
    if(!isIpconConnected){
        lgr.logErr("IPCON was not connected!");
        return;
    }
    //var device2 = new Tinkerforge.BrickletBarometer(UID, ipcon);
    lgr.log("initDevice -> " + deviceName + " " + uid);
    var device = new Tinkerforge[deviceName](uid, ipcon); //FIXME TypeError catch (name=xxx)

    return device;
}

module.exports.initCallback = function(device, attribute, func){ //TODO callback time?
    device.setAirPressureCallbackPeriod(1000);
    device.on(Tinkerforge.BrickletBarometer.CALLBACK_AIR_PRESSURE, func);
};

//module.exports.changeCallbackPeriod = function(device, attribute, time){
//
//};

module.exports.getCurrentDeviceList = function(cb_func){
    currentConnectedDivices_callback = cb_func;
    ipcon.enumerate();
};

module.exports.setIpconCallbacks = function(cb_connect, cb_disconnect){
    if(cb_connect instanceof Function)
        ipconConnectFunc = cb_connect;
    if(cb_disconnect instanceof Function)
        ipconDisconnectFunc = cb_disconnect;
}

