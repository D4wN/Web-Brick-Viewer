"use strict";

var m = angular.module('wbv.main', []);
m.controller('mainCtrl', ['$scope', '$http', '$rootScope', 'TF', 'DeviceInformation', function($scope, $http, $rootScope, TF, DeviceInformation){
    //this.templateURL = "/angular/main/main-module.jade";

    $scope.name = "Manager Tab";
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
                btnConnectChange(null, false);
                console.error("TF.ipcon.connect: " + err);
                TF.ipcon = null;
                return;
            });
            console.log(TF.ipcon);

            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
                    console.log("reason = " + connectReason);
                    $scope.$apply(function(){
                        btnConnectChange("Disconnect", false);
                    });
                }
            );
            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
                    console.log("reason = " + connectReason);
                    $scope.$apply(function(){
                        btnConnectChange("Disconnect", false);
                    });
                    TF.ipcon.enumerate();
                }
            );

            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_ENUMERATE, function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier, enumerationType){
                    if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_DISCONNECTED){
                        console.log("ENUMERATE disconnect")
                        if($scope.deviceList[uid] !== undefined){
                            $scope.$apply(function(){
                                delete $scope.deviceList[uid];
                            });
                        }


                        // if(brickViewer.deviceList[uid] !== undefined){
                        //     delete brickViewer.deviceList[uid];
                        //     if(this.currentPlugin === undefined || this.currentPlugin.deviceInformation === undefined || this.currentPlugin.deviceInformation.uid === uid){
                        //         $('#brick-uid-III_OVERVIEW').click();
                        //     }
                        // }
                    } else {
                        console.log("ENUMERATE else")
                        var deviceInformation = new DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier);
                        $scope.$apply(function(){
                            $scope.deviceList[uid] = deviceInformation;
                        });
                        // if(brickViewer.deviceList[uid] === undefined){
                        //     var deviceInformation = new DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier);
                        //     brickViewer.deviceList[uid] = deviceInformation;
                        // }
                    }
                }
            );


        }
    }
    var btnConnectDoDisconnect = function(){
        console.log("Disconecct clicked!");
        TF.ipcon.disconnect();
        TF.ipcon = null;
        $scope.deviceList = {};
        btnConnectChange("Connect", false);
    }


    $scope.test = function(){
        console.log($scope.deviceList);
    }

}]);
