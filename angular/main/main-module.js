"use strict";

var m = angular.module('wbv.main', []);
m.controller('mainCtrl', ['$scope', '$log', '$http', '$compile', 'TF', 'DeviceInformation', 'DeviceSpecs', 'WBVUtils', function($scope, $log, $http, $compile, TF, DeviceInformation, DeviceSpecs, WBVUtils){
    //this.templateURL = "/angular/main/main-module.jade";
    $scope.debug_name = "[Manager Tab]"; //TODO refactore debug_name from scope away
    let debug_name = "[Manager Tab]";

    $scope.name = $scope.debug_name;
    //Manager Tab Var---------------------------------------------------------------------------------------------------
    $scope.ipAddress = "192.168.0.14";
    $scope.websocketPort = 4280;
    // $scope.secret = "";
    $scope.deviceList = {};

    //Navigation--------------------------------------------------------------------------------------------------------
    $scope.navigationID = "connectToStack";
    $scope.navigationBtn = angular.element('#menu-content');
    $scope.changeNavigation = function(id){
        $log.log(debug_name + " Navigation: " + id);
        if(id == $scope.navigationID){
            $log.log(debug_name + " Navigation got the same ID. Change nothing.");
            return;
        }

        //Check if Submenu ID TODO deprecated?
        // if(WBVUtils.checkKey($scope.navigationSubMenu, id)){
        //     $log.log(debug_name + " Navigation Id is a Submenu. Do nothing.");
        //     return;
        // }

        let ele = angular.element('#' + id);
        let eleMenu = angular.element('#' + id + '-Menu');

        let oldEle = angular.element('#' + $scope.navigationID);
        let oldEleMenu = angular.element('#' + $scope.navigationID + '-Menu');

        //TODO better solution for Element not found?
        if(ele.length == 0 || eleMenu.length == 0 || oldEle.length == 0 || oldEleMenu.length == 0){
            $log.warn(debug_name + " Element(" + id + ") was not found!");
            return;
        }

        oldEle.removeClass('in');
        oldEleMenu.removeClass('active');
        ele.addClass('in');
        eleMenu.addClass('active');
        $scope.navigationID = id;

        // $log.log($scope.navigationBtn);
        $scope.navigationBtn.removeClass('in'); //TODO animation?
    }
    $scope.changeNavigationDefault = function(){
        $scope.navigationID = "connectToStack";
        let ele = angular.element('#' + $scope.navigationID);
        let eleMenu = angular.element('#' + $scope.navigationID + '-Menu');

        ele.addClass('in');
        eleMenu.addClass('active');
        $scope.navigationBtn.removeClass('in'); //TODO animation?
    }
    // $scope.navigationSubMenu = {}
    $scope.addNavigationSubmenu = function(navUID, subMenuConfig){
        $log.log(debug_name + ".addNavigationSubmenu(" + navUID + ")");
        if(subMenuConfig == null || subMenuConfig == undefined){
            $log.warn(debug_name + " No subMenuConfig was not found!");
            return;
        }

        let eleID = navUID + '-Menu';
        let eleMenu = angular.element('#' + eleID);
        let eleSubmenu = angular.element('#' + eleID + "-datatarget");
        if(eleMenu.length == 0){
            $log.warn(debug_name + " Element(" + eleID + ") was not found!");
            return;
        }
        if(eleSubmenu.length == 0){
            $log.warn(debug_name + " Element(" + eleID + "-datatarget) was not found!");
            return;
        }
        //Check if Submenu exists - Workaround with data-target!
        if(eleMenu.attr('data-target') != undefined){
            $log.warn(debug_name + " Submenu for Element(" + eleID + ") already exists!");
            return;
        }

        let icon = angular.element('<span class="glyphicon glyphicon-plus icon-sidenavbar-right"></span>');
        eleMenu.append(icon);
        eleMenu.removeAttr('ng-click');
        eleMenu.removeAttr('id');
        eleMenu.removeClass('in');
        eleMenu.removeClass('active');
        eleMenu.attr('data-toggle', 'collapse');
        eleMenu.attr('data-target', "#" + eleID + "-datatarget");

        let ulEle = angular.element("#" + eleID + "-datatarget");
        ulEle.addClass('in');

        //Create Submenu Entries
        for(let k in subMenuConfig){

            if(!WBVUtils.checkKey(subMenuConfig[k], 'name') || !WBVUtils.checkKey(subMenuConfig[k], 'target')){
                $log.log(debug_name + " Missing Entries in Element(" + k + ") of subMenuConfig!");
                continue;
            }

            let sub = angular.element('<li id="' + subMenuConfig[k].target + '-Menu" ng-click="changeNavigation(\'' + subMenuConfig[k].target + '\')">' + subMenuConfig[k].name + '</li>')
            $compile(sub)($scope);
            eleSubmenu.append(sub);
        }

        //Activate the new Overview Entry, if exists
        eleMenu = angular.element('#' + eleID);
        if(eleMenu.length == 0){
            return;
        }
        eleMenu.addClass('active');

        //
        // let newSubmenu = angular.element('<ul id=' + eleID + '-datatarget></ul>');
        // newSubmenu.addClass('sub-menu');
        // newSubmenu.addClass('collapse');
        // //FOR EACH IN CONFIG
        // let sub = angular.element('<li id="hallo" ng-click="changeNavigation(uidNEW)"></li>')
        //
        // newSubmenu.append(sub);
        //
        // eleMenu.insertAfter(newSubmenu);

    }

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
        // $log.log("["+ $scope.debug_name +"]btn_changed: " + text + " - " + disabled);

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
                $log.error("[" + $scope.debug_name + "]TF.ipcon.connect: " + err);
                alert("TODO: Change Message to User. TF.ipcon.connect: " + err);
                TF.ipcon = null;
                return;
            });

            $scope.navigationBtn.addClass('in'); //TODO animation?

            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_CONNECTED, function(connectReason){
                    $log.log("[" + $scope.debug_name + "]reason = " + connectReason);
                    $scope.$apply(function(){
                        btnConnectChange("Disconnect", false);
                    });
                    TF.ipcon.enumerate();
                }
            );

            TF.ipcon.on(TF.Tinkerforge.IPConnection.CALLBACK_ENUMERATE, function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier, enumerationType){
                    if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_DISCONNECTED){
                        $log.log("[" + $scope.debug_name + "]ENUMERATE disconnect")
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
        $log.info("[" + $scope.debug_name + "]Disconect clicked!");
        TF.ipcon.disconnect(function(err){
            $log.error("[" + $scope.debug_name + "] could not disconnect the ipcon! " + err);
            TF.ipcon = null;
            $scope.deviceList = {};
            $scope.changeNavigationDefault();
        });
        TF.ipcon = null;
        $scope.deviceList = {};
        $scope.changeNavigationDefault();
        btnConnectChange("Connect", false);
    }

}]);
