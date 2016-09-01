"use strict";

var angApp = angular.module('wbv');

angApp.factory('PollingValueTimer', ['$log', '$interval', 'WBVUtils', 'TF', function($log, $interval, WBVUtils, TF){
    function PollingValueTimer(interval, functionName, device, args = []){
        this.debug_name = "[PollingValueTimer| " + functionName + " ]";

        this.interval = interval; //intervall in ms
        this.functionName = functionName; //function name, like getValue
        this.device = device; //device impl
        this.args = args;

        this.currentValue = 0; //current value of the variable
        this.currentError = "THIS VALUE IS CURRENTLY NOT IMPLEMENTED!";
        this.session = null;

        // $log.log(this.debug_name + " constructed()");
    }

    PollingValueTimer.prototype.start = function(){
        // $log.log(this.debug_name + ".start()");
        if(this.session != null){
            $log.log(this.debug_name + ".start() - session == null");
            return;
        }
        if(!WBVUtils.checkKey(this.device, this.functionName)){
            $log.error(this.debug_name + ".start() - Device(" + this.device.constructor.DEVICE_DISPLAY_NAME + ") has no Function(" + this.functionName + ")!");
            return
        }

        let cb = function(...value){
            // $log.log(that.debug_name + " cb: " + value);
            if(value.length == 1) value = value[0]; //fix for one length arrays
            that.currentValue = value;
            that.currentError = null;
        };
        let cb_error = function(err){
            if(that.currentError == null) $log.warn(that.debug_name + " cb_error: " + err);
            // that.currentValue = 0;
            that.currentError = TF.getErrorDescription(err);
            //TODO CB_error Code auswerten
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
            //.getAirPressure([returnCallback][, errorCallback]
            // $log.log(that.debug_name + " got: " + tmp_args);


            that.device[that.functionName](...tmp_args);
        }, 1000, 0, true, tmp_args);


        /*
         """Starts the timer if <self._interval> is not 0 otherwise the
         timer will be canceled
         """
         if self._interval == 0:
         self.cancel()
         return

         self._t.start()
         self._was_started = True
         */
    }

    PollingValueTimer.prototype.stop = function(){
        $log.log(this.debug_name + ".stop()");
        if(this.session == null){
            $log.log(this.debug_name + ".stop() - session != null");
            return;
        }

        $interval.cancel(this.session);
        this.session = null;
        /*
         self.exit_flag = True
         self._was_started = False

         def cancel(self):
         self._t.cancel()

         def join(self):
         if self._interval == 0:  # quick fix for no timer.start()
         return

         if self._was_started:
         self._t.join()
         */
    }


    return PollingValueTimer;
}]);

/*
 class LoggerTimer(object):
 """This class provides a timer with a repeat functionality based on a interval"""

 def __init__(self, interval, func_name, var_name, device):
 """
 interval -- the repeat interval in seconds
 func -- the function which will be called
 """
 self.exit_flag = False
 if interval < 0:
 interval = 0

 self._interval = interval # in seconds
 self._func_name = func_name
 self._var_name = var_name
 self._device = device
 self._was_started = False
 self._t = Timer(self._interval, self._loop)

 def _loop(self):
 """Runs the <self._func_name> function every <self._interval> seconds"""
 start = time.time() # FIXME: use time.monotonic() in Python 3
 getattr(self._device, self._func_name)(self._var_name)
 elapsed = max(time.time() - start, 0) # FIXME: use time.monotonic() in Python 3
 self.cancel()
 if self.exit_flag:
 return
 self._t = Timer(max(self._interval - elapsed, 0), self._loop)
 self.start()

 def start(self):
 """Starts the timer if <self._interval> is not 0 otherwise the
 timer will be canceled
 """
 if self._interval == 0:
 self.cancel()
 return

 self._t.start()
 self._was_started = True

 def stop(self):
 self.exit_flag = True
 self._was_started = False

 def cancel(self):
 self._t.cancel()

 def join(self):
 if self._interval == 0:  # quick fix for no timer.start()
 return

 if self._was_started:
 self._t.join()

 */