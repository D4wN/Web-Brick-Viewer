"use strict";

var angApp = angular.module('wbv');
angApp.factory('WBVUtils', ['$log', function($log){
    function WBVUtils(){
        this.debug_name = "[WBVUtils]";

        this.UNIT_DATA = {
            Original: 0,
            Unit_Name: 1,
            Convert_Value: 2,
            Remaining: 3
        }
    }

    WBVUtils.prototype.checkKey = function(object, key){
        return object.hasOwnProperty(key);
    };

    WBVUtils.prototype.getUnitData = function(text){
        /*Different Unit entries - display or convert:
         \u00b0C             - Coded with asci? (is NaN)
         lx/10               - normal representation(+convert) (left is NaA, right is Number)
         mV                  - normal representation (is NaN)
         10m/h               - normal representation(no convert!) (left is NaN, right is NaN)
         null                - null value(no representation)

         //TODO All other Units, just display as is:
         \u00b5g/m\u00b3     - Coded on both sides(convert????)
         8/115 \u00b0/s      - normal representation(multiply and convert)
         1/100 m/s\u00b2     - normal representation(+convert & second unit?)
         */

        // $log.log(this.debug_name + ".getUnitData(" + text + ")");

        let ret = [];
        ret[this.UNIT_DATA.Original] = text; // 0 = original text
        ret[this.UNIT_DATA.Unit_Name] = ""; // 1 = everything left of '/'
        ret[this.UNIT_DATA.Convert_Value] = null; // 2 = everything right of '/' until the first 'whitespace'
        ret[this.UNIT_DATA.Remaining] = null; // 3 = everything right of the first 'whitespace'

        if(text === null || text === undefined){
            // $log.log(this.debug_name + " Text(" + text + ") was null or undefined!");
            return ret;
        }

        let indexSlash = text.indexOf('/');
        if(indexSlash == -1){
            // $log.log(this.debug_name + " text has no '/'");
            ret[this.UNIT_DATA.Unit_Name] = text;
            return ret;
        }
        ret[this.UNIT_DATA.Unit_Name] = text.substr(0, indexSlash);
        // $log.log(text + " || " + ret[this.UNIT_DATA.Unit_Name] + " || " + this.isNumberParse(ret[this.UNIT_DATA.Unit_Name]));
        //for easier use in jade later, FIXME dont convert this unit!
        if(this.isNumberParse(ret[this.UNIT_DATA.Unit_Name])){
            ret[this.UNIT_DATA.Unit_Name] = text;
            return ret;
        }
        ret[this.UNIT_DATA.Convert_Value] = text.substr(indexSlash + 1, text.length); //we dont want the '/' in our string

        let indexWhitespace = text.indexOf(' ', indexSlash);
        if(indexWhitespace == -1){
            // $log.log(this.debug_name + " text has no ' ' after '/'");
            return ret;
        }
        ret[this.UNIT_DATA.Convert_Value] = text.slice(indexSlash + 1, indexWhitespace); //remove the "Remaining"
        ret[this.UNIT_DATA.Remaining] = text.substr(indexWhitespace + 1, text.length); //we dont want the ' ' in our string


        return ret;

    }

    WBVUtils.prototype.isNumberParse = function(object){
        object = parseFloat(object);
        if(isNaN(object)){
            return false;
        }
        return (typeof object == 'number');
    }
    WBVUtils.prototype.isNumber = function(object){
        return (typeof object == 'number');
    }


    return new WBVUtils;
}]);


//TODO: src: http://stackoverflow.com/questions/30366927/test-if-an-object-is-an-emtpy-object-in-a-angularjs-template
angApp.filter('isEmpty', [function(){
    return function(object){
        return angular.equals({}, object);
    }
}])

//TODO src http://stackoverflow.com/questions/25411291/angularjs-inline-check-if-an-array-check
angApp.filter('isArray', [function(){
    return function(object){
        return angular.isArray(object);
    }
}])

angApp.filter('isNumber', [function(){
    return function(object){
        if(isNaN(object)){
            return false;
        }
        return (typeof object == 'number');
    }
}])

//TODO src: https://docs.angularjs.org/api/ng/function/angular.isNumber
// angApp.filter('isNumberSpecial', [function(){
//     return function(object){
//         return angular.isNumber(object);
//     }
// }])


angApp.filter('int', [function(){
    return function(object){
        return parseInt(object);
    }
}])
angApp.filter('float', [function(){
    return function(object){
        return parseFloat(object);
    }
}])

    
