"use strict";

var angApp = angular.module('wbv');

angApp.factory('BrickREDExtended', ['$log', 'TF', function($log, TF){
    function BrickREDExtended(){
        this.debug_name = "[BrickREDExtended]";
        this.viewName = "brickREDExtendedView"
    }

    BrickREDExtended.prototype.getController = function(){
        return ['$scope', '$log', '$interval', '$timeout', 'TF', function($scope, $log, $interval, $timeout, TF){
            let debug_name = "[BrickREDExtended|" + $scope.uid + "]";


            $log.log(debug_name + " is here!");
            $log.log($scope.deviceInfo);

            $scope.device = TF.getDeviceImpl($scope.deviceInfo.deviceClassName, $scope.uid);

            $log.log(debug_name + " RED Device from here on.")
            $log.log($scope.device);


            let SCRIPT_FOLDER = '/usr/local/scripts';
            let redSession = 0;
            let redSessionKeepAlive = null;


            let printError = function(msg, cb){
                return function(error){
                    $log.log(debug_name + " " + msg + "" + error);
                    if(cb != undefined || cb != null) cb(null);
                }
            }
            let checkREDError = function(data, additionalMsg = ""){
                if(data[0] != 0){
                    $log.error(debug_name + " " + additionalMsg + " Error: " + data[0]);
                    return true;
                }
                return false;
            }
            let releaseREDObject = function(id){
                if(redSession == 0) return;
                $scope.device.releaseObject(id, redSession, function(...data){
                    // $log.log(debug_name + "releaseREDObject() = " + data);
                    if(checkREDError(data, "releaseREDObject()")) return;
                }, printError("releaseREDObject ERROR: "));
            }


            $scope.device.createSession(60 * 10, function(...data){ //Session 10minutes
                $log.log(debug_name + "createSession() = " + data);
                if(checkREDError(data, "createSession()")) return;

                redSession = data[1];
                redSessionKeepAlive = $interval(function(){
                    $scope.device.keepSessionAlive(redSession, 60 * 10, function(...data){
                        $log.log(debug_name + "keepSessionAlive() = " + data);
                        if(checkREDError(data, "keepSessionAlive()")) return;
                    }, printError("keepSessionAlive ERROR: "));
                }, 60 * 1000 * 5, 0, true); //5minutes


                $scope.getREDPrograms();
            }, printError("createSession() ERROR: "));
            let redProcessStateTable = {};
            $log.log(TF.Tinkerforge.BrickRED.PROCESS_STATE_UNKNOWN)
            redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_UNKNOWN] = 'UNKNOWN';
            redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_RUNNING] = 'RUNNING';
            redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_ERROR] = 'ERROR';
            redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_EXITED] = 'EXITED';
            redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_KILLED] = 'KILLED';
            redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_STOPPED] = 'STOPPED';

            let getREDProcessList = function(){
                if(redSession == 0){
                    $log.log(debug_name + "getREDProcessList() redSession = " + redSession);
                    return;
                }
                $scope.device.getProcesses(redSession, function(...data){
                    $log.log(debug_name + "getProcesses() = " + data);
                    if(checkREDError(data, "getProcesses()")) return;

                }, printError("getProcesses ERROR: "))
            }

            //Program Part----------------------------------------------------------------------------------------------
            $scope.redProgramList = []; //stringData, programId, processId
            //Get ProgramList and Program Names
            //call this, to get current ProgramList and Id's
            $scope.getREDPrograms = function(){
                if(redSession == 0){
                    $log.log(debug_name + "getREDPrograms() redSession = " + redSession);
                    return;
                }
                //clear list and remove ids
                // for(let i = 0; i < $scope.redProgramList.length; i++){
                //     releaseREDObject($scope.redProgramList['programId']);
                // }
                $scope.redProgramList = [];

                $scope.device.getPrograms(redSession, function(...data){
                    $log.log(debug_name + "getREDPrograms() = " + data);
                    if(checkREDError(data, "getREDPrograms()")) return;
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
                    if(checkREDError(data, "getREDListLength()")) return;
                    cb(data);
                }, printError("getREDListLength ERROR: ", cb))
            }
            let getREDProgramItem = function(listId){
                if(redSession == 0 || listId == null){
                    $log.log(debug_name + "getREDProgramItem() redSession || listId = " + redSession + ", " + listId);
                    return null;
                }

                getREDListLength(listId, function(data){
                    if(checkREDError(data, "getREDProgramItem()")) return;

                    for(let i = 0; i < data[1]; i++){
                        $scope.device.getListItem(listId, i, redSession, function(...data){
                            // $log.log(debug_name + "getREDProgramItem() = " + data);
                            //data = [error, programId, type]
                            if(checkREDError(data, "getREDProgramItem(" + i + ")")) return;
                            let programId = data[1]; //release it!

                            $scope.device.getProgramIdentifier(programId, redSession, function(...data){
                                // $log.log(debug_name + "getProgramIdentifier() = " + data);
                                if(checkREDError(data, "getProgramIdentifier()")) return;
                                let stringId = data[1]; //release it!
                                let stringLength = null;
                                let stringData = "";

                                $scope.device.getStringLength(stringId, function(...data){
                                    // $log.log(debug_name + "getStringLength() = " + data);
                                    if(checkREDError(data, "getStringLength()")) return;
                                    stringLength = data[1];

                                    let getNextStringChunkPart = function(){
                                        $scope.device.getStringChunk(stringId, stringData.length, function(...data){
                                            $log.log(debug_name + "getStringChunk() = " + data);
                                            if(checkREDError(data, "getStringChunk()")) return;
                                            stringData += data[1];

                                            //more StringData?
                                            if(stringData.length < stringLength){
                                                getNextStringChunkPart();
                                            } else {
                                                //get lastSpawnedProcess of program(if running)
                                                $scope.device.getLastSpawnedProgramProcess(programId, redSession, function(...data){
                                                    $log.log(debug_name + "getLastSpawnedProgramProcess() = " + data);
                                                    let processId = null;
                                                    let programState = redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_STOPPED];

                                                    if(data[0] != TF.Tinkerforge.BrickRED.ERROR_CODE_DOES_NOT_EXIST){ //no programm running = ok
                                                        if(!checkREDError(data, "getLastSpawnedProgramProcess()")){
                                                            processId = data[1];
                                                            programState = redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_UNKNOWN];
                                                            $scope.device.getProcessState(processId, function(...data){
                                                                $log.log(debug_name + "getProcessState() = " + data);
                                                                if(checkREDError(data, "getProcessState()")) return;
                                                                programState = redProcessStateTable[data[1]];

                                                                //all data collected, save program and release object!
                                                                $scope.redProgramList.push({
                                                                    'stringData': stringData,
                                                                    'programId': programId,
                                                                    'programState': programState,
                                                                    'processId': processId
                                                                });
                                                            }, printError("getProcessState ERROR: "));
                                                        }
                                                    } else {
                                                        //all data collected, save program and release object!
                                                        $scope.redProgramList.push({
                                                            'stringData': stringData,
                                                            'programId': programId,
                                                            'programState': programState,
                                                            'processId': processId
                                                        });
                                                    }
                                                }, printError("getLastSpawnedProgramProcess ERROR: "));

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

            $scope.startREDProgram = function(prog){
                if(!prog) return;
                $log.log(debug_name + "startREDProgram(" + prog.programId + ") sarting...");
                //BrickRED.startProgram(programId[, returnCallback][, errorCallback])

                $scope.device.startProgram(prog.programId, function(...data){
                    $log.log(debug_name + "startProgram() = " + data);
                    if(checkREDError(data, "startProgram()")) return;
                    //check if it is realy running...
                    $scope.device.getLastSpawnedProgramProcess(prog.programId, redSession, function(...data){
                        $log.log(debug_name + "getLastSpawnedProgramProcess() = " + data);
                        if(data[0] != TF.Tinkerforge.BrickRED.ERROR_CODE_DOES_NOT_EXIST){ //no programm running = ok
                            if(!checkREDError(data, "getLastSpawnedProgramProcess()")){
                                prog.processId = data[1];
                                prog.programState = redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_RUNNING];
                            } else {
                                prog.programState = redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_STOPPED];
                            }
                        } else {
                            prog.programState = redProcessStateTable[TF.Tinkerforge.BrickRED.PROCESS_STATE_UNKNOWN];
                        }
                    }, printError("getLastSpawnedProgramProcess ERROR: "));
                }, printError("startProgram ERROR: "));
            }
            $scope.stopREDProgram = function(prog){
                if(!prog) return;
                $log.log(debug_name + "stopREDProgram(" + prog.programId + ") stopping...");
                $scope.device.killProcess(prog.processId, TF.Tinkerforge.BrickRED.PROCESS_SIGNAL_TERMINATE, function(...data){
                    $log.log(debug_name + "killProcess() = " + data);
                    if(checkREDError(data, "killProcess()")) return;

                }, printError("killProcess ERROR: "));
            }

            $scope.device.on(TF.Tinkerforge.BrickRED.CALLBACK_PROCESS_STATE_CHANGED, function(...data){
                /*
                 processId -- int
                 state -- int
                 timestamp -- int
                 exitCode -- int
                 */
                $log.log(debug_name + ".CALLBACK_PROCESS_STATE_CHANGED: " + data);
                for(let i = 0; i < $scope.redProgramList.length; i++){
                    if($scope.redProgramList[i].processId == data[0]){
                        $log.log("Changed(" + $scope.redProgramList[i].stringData + ")[" + $scope.redProgramList[i].programState + "] to [" + redProcessStateTable[data[1]] + "]");
                        //EXIT Code could be interesting
                        if(data[1] == TF.Tinkerforge.BrickRED.PROCESS_STATE_EXITED && data[3]){
                            $scope.redProgramList[i].programState = redProcessStateTable[data[1]] + "(" + data[3] + ")";
                        } else {
                            $scope.redProgramList[i].programState = redProcessStateTable[data[1]];
                        }
                    }
                }
            });

            $scope.$on("$destroy", function(){
                if(redSession == 0){
                    $scope.device.expireSession(redSession, function(...data){
                        $log.log(debug_name + "expireSession() = " + data);
                        if(checkREDError(data, "expireSession()")) return;
                    }, printError("expireSession ERROR: "));
                }

                if(redSessionKeepAlive){
                    $interval.cancel(redSessionKeepAlive);
                    redSessionKeepAlive = null;
                }
            });
        }];
    }


    return new BrickREDExtended;
}]);