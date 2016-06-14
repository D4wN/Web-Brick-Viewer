"use strict";

var tf = require('./tinkerforge');
var lgr = new (require('./simpleLogger'))("DeviceManager");

function DeviceManager(){
    this.connectedDevices = {}; //Map for Key(Name:UID) and Value(Device as JSON) of all connected devices.

    //tf.setIpconCallbacks(onDeviceConnection, onDeviceDisconnection);
};

/**
 * Fetches the current connected tinkerforge devices and checks the current registered list.
 * Sends the data to a client, if the client requests the data.
 */
DeviceManager.prototype.refreshDeviceList = function(cb_initDeviceWithSocketio, cb_client){
    var self = this;

    tf.getCurrentDeviceList(function(device){
        //log(currentConnectedDevices);
        var key = device.name + ":" + device.uid;
        if(!self.isDeviceConnected(key)){
            //add device to list
            self.connectedDevices[key] = device;
            cb_initDeviceWithSocketio(key);
        }

        //Chekc if the client should get a message with the devices
        if(cb_client == null || cb_client === undefined)
            return;
        cb_client(device);
    });
};

DeviceManager.prototype.isDeviceConnected = function(key){
    if(key in this.connectedDevices){
        lgr.log("Key(" + key + ") in List!");
        return true;
    } else {
        lgr.log("Key(" + key + ") not in List");
        return false;
    }
};

DeviceManager.prototype.initCallbackHandler = function(cb_clientConnect, cb_clientDisconnect){ //TODO why wont this work in the constructor?!
    var self = this;

    var onDeviceConnection = function(key, device){
        lgr.log(key + " connected!");
        if(!self.isDeviceConnected(key)){
            self.connectedDevices[key] = device;
            cb_clientConnect(key, device);
            lgr.log(" returned?!");
            return;
        }
    }
    var onDeviceDisconnection = function(uid){
        lgr.log(uid + " disconnected FIXME");
        return; //FIXME temp only!!!!!!!!!

        if(self.isDeviceConnected(key)){
            cb_clientDisconnect(key)
            return;
        }
    }

    tf.setIpconCallbacks(onDeviceConnection, onDeviceDisconnection);
};


//DeviceManager.prototype.onDeviceConnection = function(key){
//    lgr.logErr("onDeviceConnection NYI");
//}
//
///**
// *
// * @param uid - Only the UID is given when a device disconnects.
// */
//DeviceManager.prototype.onDeviceDisconnection = function(uid){
//    Object.keys(this.connectedDevices);
//    lgr.logErr("onDeviceDisconnection NYI");
//}

module.exports = DeviceManager