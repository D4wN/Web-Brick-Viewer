"use strict";

/**
 * Taken from https://gist.github.com/Ostrovski/9491829
 *
 * @inspired by http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
 */
var angApp = angular.module('wbv');

// Socket
angApp.factory('Socket', ['$rootScope', function($rootScope) {
    var connections = {};

    function getConnection(channel) {
        if (!connections[channel]) {
            //connections[channel] = io.connect('http://localhost:3000/' + channel);
            console.log("Connecting to " + channel);
            connections[channel] = io(channel);
        }

        return connections[channel];
    }

    function Socket(namespace) {
        if(!namespace.startsWith('/')){
            namespace = "/" + namespace;
        }
        console.log("ns: " + namespace);
        this.namespace = namespace;
    }

    Socket.prototype.on = function(eventName, callback) {
        var con = getConnection(this.namespace), self = this;
        con.on(eventName, function(){
            var args = arguments;

            $rootScope.$apply(function(){
                callback.apply(con, args);
            });
        });
    };

    Socket.prototype.emit = function(eventName, data, callback) {
        var con = getConnection(this.namespace);
        con.emit(eventName, data, function() {
            var args = arguments;

            $rootScope.$apply(function() {
                if (callback) {
                    callback.apply(con, args);
                }
            });
        })
    };

    return Socket;
}]);

//Gloabl Namepsaces
angApp.factory('Manager', ['Socket', function(Socket) {
    return new Socket('/manager');
}]);