"use strict";

var angApp = angular.module('wbv');

//FIXME Timer only working, when device tab is in focus!!!
angApp.factory('PollingValueTimer', ['$log', '$interval', 'WBVUtils', 'TF', function($log, $interval, WBVUtils, TF){
    function PollingValueTimer(interval, functionName, device, args = [], valueCallback = null){
        this.debug_name = "[PollingValueTimer| " + functionName + " ]";

        this.interval = interval; //intervall in ms
        this.functionName = functionName; //function name, like getValue
        this.device = device; //device impl
        this.args = args;
        this.valueCallback = valueCallback; //used primarily for Graphs
        this.lastValue = 0;

        this.currentValue = 0; //current value of the variable
        this.currentError = "THIS VALUE IS CURRENTLY NOT IMPLEMENTED!";
        this.session = null;

        // $log.log(this.debug_name + " constructed()");
    }

    PollingValueTimer.prototype.start = function(){
        // $log.log(this.debug_name + ".start()");
        if(this.session != null){
            $log.log(this.debug_name + ".start() - session != null");
            return;
        }
        if(!WBVUtils.checkKey(this.device, this.functionName)){
            $log.error(this.debug_name + ".start() - Device(" + this.device.CLASS_NAME + ") has no Function(" + this.functionName + ")!"); //FIXME get the device name! no device.constructor.DEVICE_DIPLAY_NAME!!!
            return
        }

        let cb = function(...value){
            // $log.log(that.debug_name + " cb: " + value);
            if(value.length == 1) value = value[0]; //fix for one length arrays
            that.lastValue = that.currentValue;
            that.currentValue = value;
            that.currentError = null;

            //Used fro extenden Views and Graphs
            if(that.valueCallback){
                // $log.log(that.debug_name + " valueCallback()");
                that.valueCallback(value);
            }
        };
        let cb_error = function(err){
            if(that.currentError == null) $log.warn(that.debug_name + " cb_error: " + err);
            // that.currentValue = 0;
            that.currentError = TF.getErrorDescription(err);
            //TODO CB_error Code auswerten

            //Used fro extenden Views and Graphs
            if(that.valueCallback){
                // $log.log(that.debug_name + " valueCallback()");
                that.valueCallback(that.lastValue);
            }
        };


        let tmp_args = []
        //check if args is empty
        if(this.args.length != 0){ //args from json
            $log.log(this.debug_name + " start() - Args Array not empty");
            tmp_args.push(args);
        }
        tmp_args.push(cb);
        tmp_args.push(cb_error);

        let that = this;
        this.session = $interval(function(){

            that.device[that.functionName](...tmp_args);
        }, this.interval, 0, true, tmp_args);
    }

    PollingValueTimer.prototype.stop = function(){
        // $log.log(this.debug_name + ".stop()");
        if(this.session == null){
            $log.log(this.debug_name + ".stop() - session == null");
            return;
        }

        $interval.cancel(this.session);
        this.session = null;
    }


    return PollingValueTimer;
}]);