"use strict";

var angApp = angular.module('wbv');

//GPS
angApp.factory('SpecialBrickletGPS', ['$log', function($log){
    function SpecialBrickletGPS(){
        this.debug_name = "[SpecialBrickletGPS]";
    }

    SpecialBrickletGPS.prototype.getStatus = function(deviceGPS){
        return new Promise(function(resolve, reject){
            deviceGPS.getStatus(function(...data){
                resolve(data);

            }, function(err){
                return reject(err);
            });
        });
    }

    SpecialBrickletGPS.prototype.inject = function(deviceGPS,TF){
        // $log.log(this.debug_name + "inject(deviceGPS)");
        let that = this;

        deviceGPS['special_get_gps_coordinates'] = function(cb, cb_error){
            that.getStatus(deviceGPS).then(function(){
                if(arguments[0][0] == TF.Tinkerforge.BrickletGPS.FIX_NO_FIX){
                    cb_error("No Fix!");
                } else {
                    deviceGPS.getCoordinates(function(...data){
                        cb(data);
                    }, function(err){
                        cb_error(err);
                    });
                }

            }),function(err){
                cb_error(err);
            };
        };
        $log.log(that.debug_name + ".special_get_gps_coordinates() injected");

        deviceGPS['special_get_gps_altitude'] = function(cb, cb_error){
            that.getStatus(deviceGPS).then(function(){
                if(arguments[0][0] != TF.Tinkerforge.BrickletGPS.FIX_3D_FIX){
                    cb_error("No 3D Fix!");
                } else {
                    deviceGPS.getAltitude(function(...data){
                        cb(data);
                    }, function(err){
                        cb_error(err);
                    });
                }

            }),function(err){
                cb_error(err);
            };
        };
        $log.log(that.debug_name + ".special_get_gps_altitude() injected");

        deviceGPS['special_get_gps_motion'] = function(cb, cb_error){
            that.getStatus(deviceGPS).then(function(){
                if(arguments[0][0] == TF.Tinkerforge.BrickletGPS.FIX_NO_FIX){
                    cb_error("No Fix!");
                } else {
                    deviceGPS.getMotion(function(...data){
                        cb(data);
                    }, function(err){
                        cb_error(err);
                    });
                }

            }),function(err){
                cb_error(err);
            };
        };
        $log.log(that.debug_name + ".special_get_gps_motion() injected");
    }

    return new SpecialBrickletGPS;
}]);

//Color
angApp.factory('SpecialBrickletColor', ['$log', function($log){
    function SpecialBrickletColor(){
        this.debug_name = "[SpecialBrickletColor]";
    }

    SpecialBrickletColor.prototype.inject = function(deviceColor, TF){
        // $log.log(this.debug_name + "inject(deviceColor)");
        let that = this;

        $log.log(that.debug_name + ".special_get_get_illuminance() injected");
        deviceColor['special_get_get_illuminance'] = function(cb, cb_error){

            //needed variables
            let gain, integrationTime, illuminance = null;

            //wait for all async calls to finish via promises
            let promises = [];
            promises.push(new Promise(function(resolve, reject){
                    deviceColor.getConfig(function(...data){
                        gain = data[0];
                        integrationTime = data[1];
                        resolve(data);

                    }, function(err){
                        return reject(err);
                    });
                })
            );
            promises.push(new Promise(function(resolve, reject){
                    deviceColor.getIlluminance(function(...data){
                        illuminance = data[0];
                        resolve(data);

                    }, function(err){
                        return reject(err);
                    });
                })
            );

            Promise.all(promises).then(function(){
                let gainFactor, integrationTimeFactor = null;

                if(gain == TF.Tinkerforge.BrickletColor.GAIN_1X){
                    gainFactor = 1;
                } else if(gain == TF.Tinkerforge.BrickletColor.GAIN_4X){
                    gainFactor = 4;
                } else if(gain == TF.Tinkerforge.BrickletColor.GAIN_16X){
                    gainFactor = 16;
                } else if(gain == TF.Tinkerforge.BrickletColor.GAIN_60X){
                    gainFactor = 60;
                }

                if(integrationTime == TF.Tinkerforge.BrickletColor.INTEGRATION_TIME_2MS){
                    integrationTimeFactor = 2.4;
                } else if(integrationTime == TF.Tinkerforge.BrickletColor.INTEGRATION_TIME_24MS){
                    integrationTimeFactor = 24;
                } else if(integrationTime == TF.Tinkerforge.BrickletColor.INTEGRATION_TIME_101MS){
                    integrationTimeFactor = 101;
                } else if(integrationTime == TF.Tinkerforge.BrickletColor.INTEGRATION_TIME_154MS){
                    integrationTimeFactor = 154;
                } else if(integrationTime == TF.Tinkerforge.BrickletColor.INTEGRATION_TIME_700MS){
                    integrationTimeFactor = 700;
                }


                if(illuminance == null || gainFactor == null || integrationTimeFactor == null){
                    $log.warn(thath.debug_name + ".special_get_get_illuminance() illuminance, gainFactor or integrationTimeFactor were null!");
                    cb_error(TF.Tinkerforge.ipcon.ERROR_CODE_UNKNOWN_ERROR); //unknown error
                }

                //original python: //int(round(illuminance * 700.0 / float(gain_factor) / float(integration_time_factor), 1) * 10)
                let erg = (illuminance * 700.0 / parseFloat(gainFactor) / parseFloat(integrationTimeFactor));
                erg = parseInt(Math.round(erg * 10));
                cb(erg);

            }, function(err){
                cb_error(err);
            });
        };
    }

    return new SpecialBrickletColor;
}]);


//Other Special Cases