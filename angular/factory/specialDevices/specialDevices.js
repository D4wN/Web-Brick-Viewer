"use strict";

var angApp = angular.module('wbv');

//GPS
angApp.factory('SpecialBrickletGPS', ['$log', function($log) {
    function SpecialBrickletGPS() {
        this.debug_name = "[SpecialBrickletGPS]";
        
    }

    SpecialBrickletGPS.prototype.inject = function(deviceGPS){
        $log.log(this.debug_name + "inject(deviceGPS)");
        
        deviceGPS['special_get_hallo_welt'] = function(args, cb, cb_error){ //TODO, b.special_get(cb, cberror);
            cb("special_get_hallo_welt::args=" + args);
            return;
        };
    }

    return new SpecialBrickletGPS;
}]);

//Other Special Cases