"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickREDExtended', ['$log', 'TF', function($log, TF){
    function BrickREDExtended(){
        this.debug_name = "[BrickREDExtended]";
        this.viewName = "brickREDExtendedView"
    }

    BrickREDExtended.prototype.getController = function(){
        return ['$scope', '$log', 'TF', function($scope, $log, TF){
            let debug_name = "[BrickREDExtended|" + $scope.uid + "]";


            $log.log(debug_name + " is here!");
            $log.log($scope.deviceInfo);

            $scope.device = TF.getDeviceImpl($scope.deviceInfo.deviceClassName, $scope.uid);

            $log.log(debug_name + " RED Device from here on.")
            $log.log($scope.device);


            let SCRIPT_FOLDER = '/usr/local/scripts';
            let redSession = 0;


            let printError = function(msg, cb){
                return function(error){
                    $log.log(debug_name + " " + msg + "" + error);
                    if(cb != undefined || cb != null) cb(null);
                }
            }
            let checkREDError = function(errorNumber, additionalMsg = ""){
                if(errorNumber != 0){
                    $log.error(debug_name + " " + additionalMsg + " Error: " + errorNumber);
                    return true;
                }
                return false;
            }
            let releaseREDObject = function(id){
                if(redSession == 0) return;
                $scope.device.releaseObject(id, redSession, function(...data){
                    $log.log(debug_name + "releaseREDObject() = " + data);
                    if(checkREDError(data[0], "releaseREDObject()")) return;
                }, printError("releaseREDObject ERROR: "))
            }


            $scope.device.createSession(60 * 10, function(...data){ //Session 10minutes
                $log.log(debug_name + "createSession() = " + data);
                if(checkREDError(data[0], "createSession()")) return;

                redSession = data[1];
                getREDPrograms();
            }, printError("createSession() ERROR: "));
            //TODO BrickRED.keepSessionAlive + expireSessionUnchecked

            let getREDProcessList = function(){
                if(redSession == 0){
                    $log.log(debug_name + "getREDProcessList() redSession = " + redSession);
                    return;
                }
                $scope.device.getProcesses(redSession, function(...data){
                    $log.log(debug_name + "getProcesses() = " + data);
                    if(checkREDError(data[0], "getProcesses()")) return;

                }, printError("getProcesses ERROR: "))
            }

            //Program Part----------------------------------------------------------------------------------------------
            $scope.redProgramList = []; //stringData, programId
            //Get ProgramList and Program Names
            //call this, to get current ProgramList and Id's
            let getREDPrograms = function(){
                if(redSession == 0){
                    $log.log(debug_name + "getREDPrograms() redSession = " + redSession);
                    return;
                }
                //clear list
                $scope.redProgramList = [];

                $scope.device.getPrograms(redSession, function(...data){
                    $log.log(debug_name + "getREDPrograms() = " + data);
                    if(checkREDError(data[0], "getREDPrograms()")) return;
                    getREDProgramItem(data[1]);
                }, printError("getREDPrograms ERROR: "))
            }
            let getREDListLength = function(listId, cb){
                if(redSession == 0 || listId == null){
                    $log.log(debug_name + "getREDListLength() redSession || listId = " + redSession + ", " + listId);
                    return null;
                }
                $scope.device.getListLength(listId, function(...data){
                    $log.log(debug_name + "getREDListLength() = " + data);
                    if(checkREDError(data[0], "getREDListLength()")) return;
                    cb(data);
                }, printError("getREDListLength ERROR: ", cb))
            }
            let getREDProgramItem = function(listId){
                if(redSession == 0 || listId == null){
                    $log.log(debug_name + "getREDProgramItem() redSession || listId = " + redSession + ", " + listId);
                    return null;
                }

                getREDListLength(listId, function(data){
                    if(checkREDError(data[0], "getREDProgramItem()")) return;

                    for(let i = 0; i < data[1]; i++){
                        $scope.device.getListItem(listId, i, redSession, function(...data){
                            // $log.log(debug_name + "getREDProgramItem() = " + data);
                            //data = [error, programId, type]
                            if(checkREDError(data[0], "getREDProgramItem(" + i + ")")) return;
                            let programId = data[1]; //release it!

                            $scope.device.getProgramIdentifier(programId, redSession, function(...data){
                                // $log.log(debug_name + "getProgramIdentifier() = " + data);
                                if(checkREDError(data[0], "getProgramIdentifier()")) return;
                                let stringId = data[1]; //release it!
                                let stringLength = null;
                                let stringData = "";

                                $scope.device.getStringLength(stringId, function(...data){
                                    // $log.log(debug_name + "getStringLength() = " + data);
                                    if(checkREDError(data[0], "getStringLength()")) return;
                                    stringLength = data[1];

                                    let getNextStringChunkPart = function(){
                                        $scope.device.getStringChunk(stringId, stringData.length, function(...data){
                                            $log.log(debug_name + "getStringChunk() = " + data);
                                            if(checkREDError(data[0], "getStringChunk()")) return;
                                            stringData += data[1];

                                            //more StringData?
                                            if(stringData.length < stringLength){
                                                getNextStringChunkPart();
                                            } else {
                                                //all data collected, save program and release object!
                                                $scope.redProgramList.push({
                                                    'stringData' : stringData,
                                                    'programId' : programId
                                                });

                                                releaseREDObject(stringId);
                                            }
                                        }, printError("getStringChunk ERROR: "));
                                    }

                                    getNextStringChunkPart();

                                }, printError("getStringLength ERROR: "));
                            }, printError("getProcesses ERROR: "));
                        });
                    }
                    releaseREDObject(listId);//release it!

                }, printError("getREDProgramItem ERROR: "));
            }

        }];
    }


    return new BrickREDExtended;
}]);