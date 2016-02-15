"use strict";

var io = require('socket.io')();
var tf = require('./tinkerforge');

var prefix = "[Socket.io]";
var tfDeviceList = [];
var tfDeviceNamespaces = {};

//Debug Logger TODO
var log = function(msg){
    console.log(prefix + msg);
}
var logErr = function(msg){
    console.error(prefix + msg);
}
/*FUNCTIONS************************************************************************************************************/

/*NAMESPACES***********************************************************************************************************/

/* Manager Namepsace(/manager)
 *   init
 */
var manager = io.of('/manager');
manager.on('connection', function(socket){
    log("Manager logged on!");
    //Init - get current connected TF devices
    socket.on('init', function(){
        var data = tfDeviceList;
        //data = tf.getCurrentDeviceList(); //TODO make dynamic
        socket.emit('init', data); //Emits directly to the socket
        //manager.emit('init', data); //Emit to ALL subscribed sockets

    })
});

/* testBrick Namepsace(/manager)
 *
 */
//var testBrick = io.of('Barometer Bricklet:fVP');
//testBrick.on('connection', function(socket){
//    log("testBrick connected!");
//
//});

//Init Device Namepsaces
var initDeviceNamepsaces = function(){
    //for each...
    tfDeviceNamespaces['Barometer Bricklet:fVP'] = {};
    tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'] = io.of('Barometer Bricklet:fVP');
    tfDeviceNamespaces['Barometer Bricklet:fVP']['device'] = tf.initDevice(null, "fVP");//TODO cahnge values
    tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'].on('connection', function(){
        log("[Barometer Bricklet:fVP'] Connected!");


    });

    tf.initCallback(tfDeviceNamespaces['Barometer Bricklet:fVP']['device'], null, function(value){ //TODO change values
        tfDeviceNamespaces['Barometer Bricklet:fVP']['namespace'].emit('airPressure', value);
    });

}

/*EXPORTS**************************************************************************************************************/
exports.init = function(server){
    if(server === undefined){
        console.error("Socket.io could not be initialized! Server was given undefined!")
        return;
    }

    io.listen(server);
    console.log("Socket.io listening.");
    tfDeviceList = tf.getCurrentDeviceList();
    initDeviceNamepsaces();
}