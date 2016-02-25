"use strict";

var io = require('socket.io')();
var tf = require('./tinkerforge');

var prefix = "[Socket.io]";
var currentConnectedDevices = {}; //to check if tf.enumerate returned new not initilaized devices!
//var tfDeviceNamespaces = {};

//Debug Logger TODO
var log = function(msg){
    console.log(prefix + msg);
}
var logErr = function(msg){
    console.error(prefix + msg);
}
/*FUNCTIONS************************************************************************************************************/
/**
 * Sends device data to the client. Only init!
 * TODO add Update function(disconnect device, connect new, etc.)
 * @param socket
 */
var sendDevicesToClient = function(socket){
    //clean data(remove socketio entry)
    getCurrentDeviceList(function(device){
        log("Sending Data...");
        socket.emit('init', device); //Emits directly to the socket
    })
}

/** TODO create a seperated class for this (DeviceManager)
 * Fetches the current connected tinkerforge devices and checks the current registered list.
 * Sends the data to a client, if the client requests the data.
 */
var getCurrentDeviceList = function(cb_client){
    tf.getCurrentDeviceList(function(device){
        //log(currentConnectedDevices);
        var key = device.name + ":" + device.uid;
        if(key in currentConnectedDevices)
            log("Key(" + key + ") in List!!!");
        else {
            log("Key(" + key + ") not in List");
            currentConnectedDevices[key] = device;
            initDeviceNamepsaces(key)
        }
        if(cb_client == null || cb_client === undefined)
            return;

        cb_client(device);
    });
}

/*NAMESPACES***********************************************************************************************************/

/* Manager Namepsace(/manager)
 *   init
 */
var manager = io.of('/manager');
manager.on('connection', function(socket){
    var client_ip_address = socket.request.connection.remoteAddress;
    log("Manager(" + client_ip_address + ") logged on!");
    //Init - get current connected TF devices
    socket.on('init', function(){
        sendDevicesToClient(socket);
        //socket.emit('init', data); //Emits directly to the socket
        //manager.emit('init', data); //Emit to ALL subscribed sockets

    })
});

/* testBrick Namepsace(/manager)
 *
 */
//Init Device Namepsaces
var initDeviceNamepsaces = function(deviceKey){
    currentConnectedDevices[deviceKey]['socketio'] = {};
    currentConnectedDevices[deviceKey]['socketio']['namespace'] = io.of(deviceKey);
    currentConnectedDevices[deviceKey]['socketio']['device'] = tf.initDevice(currentConnectedDevices[deviceKey]['name'], currentConnectedDevices[deviceKey]['uid']);
    //Socket.io Namepsace
    currentConnectedDevices[deviceKey]['socketio']['namespace'].on('connection', function(socket){
        log("[" + deviceKey + "] Connected!");

        var dev = currentConnectedDevices[deviceKey]['socketio']['namespace'];
        socket.on('init', function(){
            log("[" + deviceKey + "] Got Init.");
            socket.emit('init', "Hallo " + deviceKey);
        });

    });
    //tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'].on('connection', function(socket){
    //    log("[Barometer Bricklet:fVP'] Connected!");
    //
    //    var dev = tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'];
    //    socket.on('init', function(){
    //        console.log('got init');
    //        socket.emit('init', "Hallo Welt!");
    //    });
    //
    //});
    //
    //
    //tf.initCallback(tfDeviceNamespaces['Barometer Bricklet:fVP']['device'], null, function(value){ //TODO change values
    //    //console.log("[Barometer Bricklet:fVP']airPressure = " + value);
    //    tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'].emit('airPressure', value);
    //});

}

/*EXPORTS**************************************************************************************************************/
exports.init = function(server){
    if(server === undefined){
        logErr("Socket.io could not be initialized! Server was given undefined!")
        return;
    }

    io.listen(server);
    log("Socket.io listening.");

    //currentConnectedDevices['BrickMaster:68zo2F'] = null; //DEBUG only
    //currentConnectedDevices['BrickletBarometer:fVP'] = null;
    getCurrentDeviceList();
    //initDeviceNamepsaces();
}