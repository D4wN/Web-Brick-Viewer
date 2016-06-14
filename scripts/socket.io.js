"use strict";

var io = require('socket.io')();
var tf = require('./tinkerforge');
var lgr = new (require('./simpleLogger'))("Socket.io");
var deviceManager = new (require('./deviceManager'))();


/*FUNCTIONS************************************************************************************************************/


/** TODO create a seperated class for this (DeviceManager)
 * Fetches the current connected tinkerforge devices and checks the current registered list.
 * Sends the data to a client, if the client requests the data.
 */
//var getCurrentDeviceList = function(cb_client){
//    tf.getCurrentDeviceList(function(device){
//        //lgr.log(deviceManager.connectedDevices);
//        var key = device.name + ":" + device.uid;
//        if(key in deviceManager.connectedDevices)
//            lgr.log("Key(" + key + ") in List!!!");
//        else {
//            lgr.log("Key(" + key + ") not in List");
//            deviceManager.connectedDevices[key] = device;
//            initDeviceNamepsaces(key)
//        }
//        if(cb_client == null || cb_client === undefined)
//            return;
//
//        cb_client(device);
//    });
//}

/*NAMESPACES***********************************************************************************************************/

/* Manager Namepsace(/manager)
 *   init
 */
var manager = io.of('/manager');
manager.on('connection', function(socket){
    var client_ip_address = socket.request.connection.remoteAddress;
    lgr.log("Manager(" + client_ip_address + ") logged on!");
    //Init - get current connected TF devices
    socket.on('init', function(){
        sendDevicesToClient(socket);
        //socket.emit('init', data); //Emits directly to the socket
        //manager.emit('init', data); //Emit to ALL subscribed sockets

    })
});
/**
 * Sends device data to the client. Only init!
 * TODO add Update function(disconnect device, connect new, etc.)
 * @param socket
 */
var sendDevicesToClient = function(socket){
    //clean data(remove socketio entry)

    deviceManager.refreshDeviceList(initDeviceNamepsaces, function(device){
        lgr.log("Sending Data...");
        socket.emit('init', device); //Emits directly to the socket
    })
}

var updateClientWithConnectedDevice = function(key, device){
    lgr.log("Sending Update Connect...");
    manager.emit('update', {'connect': device}); //device  is self referencing?!
    initDeviceNamepsaces(key);

}

var updateClientWithDisconnectedDevice = function(device){ //TODO rework this part
    lgr.log("Sending Update Disconnect...");
    manager.emit('update', {'disconnect': device});
}

/* testBrick Namepsace(/manager)
 *
 */
//Init Device Namepsaces
var initDeviceNamepsaces = function(deviceKey){
    deviceManager.connectedDevices[deviceKey]['socketio'] = {};
    deviceManager.connectedDevices[deviceKey]['socketio']['namespace'] = io.of(deviceKey);
    deviceManager.connectedDevices[deviceKey]['socketio']['device'] = tf.initDevice(deviceManager.connectedDevices[deviceKey]['name'], deviceManager.connectedDevices[deviceKey]['uid']);
    //Socket.io Namepsace
    deviceManager.connectedDevices[deviceKey]['socketio']['namespace'].on('connection', function(socket){
        lgr.log("[" + deviceKey + "] Connected!");

        var dev = deviceManager.connectedDevices[deviceKey]['socketio']['namespace'];
        socket.on('init', function(){
            lgr.log("[" + deviceKey + "] Got Init.");
            socket.emit('init', "Hello from " + deviceKey);
        });

    });
    //tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'].on('connection', function(socket){
    //    lgr.log("[Barometer Bricklet:fVP'] Connected!");
    //
    //    var dev = tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'];
    //    socket.on('init', function(){
    //        lgr.log('got init');
    //        socket.emit('init', "Hallo Welt!");
    //    });
    //
    //});
    //
    //
    //tf.initCallback(tfDeviceNamespaces['Barometer Bricklet:fVP']['device'], null, function(value){ //TODO change values
    //    //lgr.log("[Barometer Bricklet:fVP']airPressure = " + value);
    //    tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'].emit('airPressure', value);
    //});

}

/*EXPORTS**************************************************************************************************************/
module.exports.init = function(server){
    if(server === undefined){
        lgr.logErr("Socket.io could not be initialized! Server was given undefined!")
        return;
    }

    io.listen(server);
    lgr.log("Socket.io listening.");

    //deviceManager.connectedDevices['BrickMaster:68zo2F'] = null; //DEBUG only
    //deviceManager.connectedDevices['BrickletBarometer:fVP'] = null;
    deviceManager.initCallbackHandler(updateClientWithConnectedDevice, updateClientWithDisconnectedDevice);
    deviceManager.refreshDeviceList(initDeviceNamepsaces);
    //initDeviceNamepsaces();
}