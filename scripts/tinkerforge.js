"use strict";

var Tinkerforge = require('tinkerforge');
var io = require('../scripts/socket.io.js');

var tfPORT = process.env.TFPORT || 4223;
var tfHOST = 'localhost'; //TODO is it always localhost?!
var ipcon = new Tinkerforge.IPConnection();
var isIpconConnected = false;

var deviceIdentifierToObject = {}   //Key: DeviceIdentifier   Value: DeviceObject
var currentConnectedDivices = [] //Array, could be more than one of the same, e.g. 2x Barometer
var currentConnectedDivices_callback = null;

var socketServer = null; //for socket.io

// Connect to brickd

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
        isIpconConnected = true;
        console.log("IPCON connected");
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
        //console.log(i + ":" + device.DEVICE_DISPLAY_NAME + ":" + device.DEVICE_IDENTIFIER);
    }
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_ENUMERATE,
    function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier, enumerationType){
        // Print incoming enumeration
        //console.log('UID:               '+uid);
        //console.log('Enumeration Type:  '+enumerationType);
        //if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_DISCONNECTED) {
        //    console.log('');
        //    return;
        //
        //}
        //console.log('Connected UID:     '+connectedUid);
        //console.log('Position:          '+position);
        //console.log('Hardware Version:  '+hardwareVersion);
        //console.log('Firmware Version:  '+firmwareVersion);
        //console.log('Device Identifier: '+deviceIdentifier);
        //console.log('Device Display Name: '+deviceIdentifierToObject[deviceIdentifier].DEVICE_DISPLAY_NAME);
        //console.log('Device Name: '+deviceIdentifierToObject[deviceIdentifier].name);
        //console.log('');

        if(currentConnectedDivices_callback != null){
            // Create the currentConnectedDivices List
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
            // Add Device to global List
            //currentConnectedDivices.push(device)

            currentConnectedDivices_callback(device);
        }
    }
);

exports.init = function(server){
    socketServer = server;
    ipcon.connect(tfHOST, tfPORT,
        function(error){
            console.log('Error: ' + error);
        }
    );
}

exports.initDevice = function(deviceName, uid){
    if(!isIpconConnected){
        console.error("IPCON was not connected!");
        return;
    }
    //var device2 = new Tinkerforge.BrickletBarometer(UID, ipcon);
    console.log("tinkerforge:initDevice -> " + deviceName + " " + uid);
    var device = new Tinkerforge[deviceName](uid, ipcon); //FIXME TypeError catch (name=xxx)

    return device;
}

exports.initCallback = function(device, attribute, func){ //TODO callback time?
    device.setAirPressureCallbackPeriod(1000);
    device.on(Tinkerforge.BrickletBarometer.CALLBACK_AIR_PRESSURE, func);
};

//exports.changeCallbackPeriod = function(device, attribute, time){
//
//};

exports.getCurrentDeviceList = function(cb_func){
    currentConnectedDivices_callback = cb_func;
    // Clear Global Device List
    //currentConnectedDivices = [];
    ipcon.enumerate();

    //var data = {
    //    devices: ['Barometer Bricklet:fVP', 'temperaturbricklet:UID', 'ambientlightbricklet:UID']
    //};
    //
    //return data;
};