"use strict";

var SSH = require('simple-ssh');

module.exports = function(config){
    if(config.host === undefined){
        lgr.logErr("SSH could not be initialized! Host was given undefined!");
        return null;
    }
    if(config.username === undefined){
        lgr.logErr("SSH could not be initialized! Username was given undefined!");
        return null;
    }
    if(config.password === undefined){
        lgr.logErr("SSH could not be initialized! Host was given undefined!");
        return null;
    }
    if(config.port === undefined){
        lgr.logErr("SSH could not be initialized! Port was given undefined!");
        return null;
    }

    return new SSH({
        host: config.host,
        user: config.username,
        pass: config.password,
        port: config.port,
        // baseDir: null
    });
}