"use strict";

var angApp = angular.module('wbv');

//TODO: src: http://stackoverflow.com/questions/30366927/test-if-an-object-is-an-emtpy-object-in-a-angularjs-template
angApp.filter('isEmpty', [function() {
    return function(object) {
        return angular.equals({}, object);
    }
}])