"use strict";

var Tinkerforge = require('tinkerforge');
var io = require('../scripts/socket.io.js');

var tfPORT = process.env.TFPORT || 4223;
var tfHOST = 'localhost'; //TODO is it always localhost?!
var ipcon = new Tinkerforge.IPConnection();
var isIpconConnected = false;
var socketServer = null; //for socket.io

 // Connect to brickd

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
        isIpconConnected = true;
        console.log("IPCON connected");
        io.init(socketServer);
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

exports.initDevice = function(deviceName, UID){
    if(!isIpconConnected){
        console.error("IPCON was not connected!");
        return;
    }
    var device = new Tinkerforge.BrickletBarometer(UID, ipcon);
    return device;
}

exports.initCallback = function(device, attribute, func){ //TODO callback time?
    device.setAirPressureCallbackPeriod(1000);
    device.on(Tinkerforge.BrickletBarometer.CALLBACK_AIR_PRESSURE, func);
};

//exports.changeCallbackPeriod = function(device, attribute, time){
//
//};

exports.getCurrentDeviceList = function(){
    var data = {
        devices: ['Barometer Bricklet:fVP', 'temperaturbricklet:UID', 'ambientlightbricklet:UID']
    };

    return data;
};