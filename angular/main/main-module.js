"use strict";

var m = angular.module('wbv.main', []);
m.controller('mainCtrl', ['$scope', '$log', '$http', 'TF', 'DeviceInformation', 'DeviceSpecs', function($scope, $log, $http, TF, DeviceInformation, DeviceSpecs){
    //this.templateURL = "/angular/main/main-module.jade";
    $scope.debug_name = "Manager Tab";
    $scope.name = $scope.debug_name;
    //Manager Tab Var---------------------------------------------------------------------------------------------------
    $scope.ipAddress = "192.168.0.14";
    $scope.websocketPort = 4280;
    // $scope.secret = "";
    $scope.deviceList = {};

    //Button Connect ---------------------------------------------------------------------------------------------------
    $scope.btnConnectText = "Connect";
    $scope.btnConnectDisabled = false;
    $scope.btnConnectFunction = function(){
        if($scope.btnConnectText == "Connect"){
            //ipcon is NOT connected
            btnConnectDoConnect();
        } else {
            //ipcon is connected();
            btnConnectDoDisconnect();
        }
    }
    var btnConnectChange = function(text, disabled){
        $log.log("["+ $scope.debug_name +"]btn_changed: " + text + " - " + disabled);

        if(text !== null && text !== undefined)
            $scope.btnConnectText = text;
        if(disabled !== null && disabled !== undefined)
            $scope.btnConnectDisabled = disabled;


    }
    var btnConnectDoConnect = function(){
        if(TF.ipcon !== null && TF.ipcon !== undefined){
            return;
        }
        else {
            btnConnectChange("Connecting...", true);

            TF.ipcon = new TF.Tinkerforge.IPConnection();
            TF.ipcon.connect($scope.ipAddress, $scope.websocketPort, function(err){
                $scope.$apply(function(){
                    btnConnectChange("Connect", false);
                });
                $log.error("["+ $scope.debug_name +"]TF.ipcon.connect: " + err);
                alert("TODO: Change Message to User. TF.ipcon.connect: " + err);
                TF.ipcon = null;
                return;
            });
            // $log.log(TF.ipcon);

            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
                    $log.log("["+ $scope.debug_name +"]reason = " + connectReason);
                    $scope.$apply(function(){
                        btnConnectChange("Disconnect", false);
                    });
                }
            );
            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
                    $log.log("["+ $scope.debug_name +"]reason = " + connectReason);
                    $scope.$apply(function(){
                        btnConnectChange("Disconnect", false);
                    });
                    TF.ipcon.enumerate();
                }
            );

            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_ENUMERATE, function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier, enumerationType){
                    if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_DISCONNECTED){
                        $log.log("["+ $scope.debug_name +"]ENUMERATE disconnect")
                        if($scope.deviceList[uid] !== undefined){
                            $scope.$apply(function(){
                                delete $scope.deviceList[uid];
                            });
                        }
                    } else {
                        // $log.log("["+ $scope.debug_name +"]ENUMERATE else")
                        var deviceInformation = new DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier);
                        $scope.$apply(function(){
                            $scope.deviceList[uid] = deviceInformation;
                        });
                    }
                }
            );


        }
    }
    var btnConnectDoDisconnect = function(){
        $log.info("["+ $scope.debug_name +"]Disconect clicked!");
        TF.ipcon.disconnect();
        TF.ipcon = null;
        $scope.deviceList = {};
        btnConnectChange("Connect", false);
    }



    //TESt some functions
    $scope.test = function(){
        // let m = WBVUtils.regexUnitName("lx/100 lx")
        // $log.log("Regex Test:");
        // $log.log(WBVUtils.getUnitData("\u00b0C"));
        // $log.log(WBVUtils.getUnitData("22marv/133337 hier is derr rest"));
        // $log.log(WBVUtils.getUnitData("mV"));
        // $log.log(WBVUtils.getUnitData("10m/h"));
        // $log.log(WBVUtils.getUnitData("1/100 m/s\u00b2"));
        // $log.log(WBVUtils.getUnitData("lx/1234 hallo welt"));



    }
}]);
