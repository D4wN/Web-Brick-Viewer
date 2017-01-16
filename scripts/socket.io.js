"use strict";

var io = require('socket.io')();
var lgr = new (require('./simpleLogger'))("Socket.io");
var SSH = require('./mySSH');

var sshList = {};

/*FUNCTIONS************************************************************************************************************/
const sshResult = function(success, output, pwd = null){
    return {
        success: success,
        output: output,
        pwd: pwd
    }
}

const executeCommand = function(client_ip_address, command, cb){
    lgr.log("SSH executeCommand(" + client_ip_address + ") command: '" + command + "' in " + sshList[client_ip_address].baseDir);
    sshList[client_ip_address].exec(command, {
        out: function(stdout){
            sshList[client_ip_address].reset();
            cb(sshResult(true, stdout, getPWDString(client_ip_address))); //only successful execs should have pwd
        },
        err: function(stderr){
            sshList[client_ip_address].reset();
            cb(sshResult(false, stderr));
        },
        exit: function(code){
            //code 0 = ok
            if(code != 0){
                sshList[client_ip_address].reset();
                cb(sshResult(false, "Exit Code:" + code));
            }
        }
    }).start({
        success: function(){
            // lgr.log("executeCommand success");
        }, fail: function(err){
            // lgr.log("executeCommand failed: " + err);
        }
    });
}

const isPathAbsolute = function(path){ //src: http://stackoverflow.com/a/17819167
    return /^(?:\/|[a-z]+:\/\/)/.test(path);
}
const changeDirectory = function(client_ip_address, path, cb){
    lgr.log("SSH changeDirectory(" + client_ip_address + ") changing from " + sshList[client_ip_address].baseDir + " to " + path);
    sshList[client_ip_address].baseDir = path;
    executeCommand(client_ip_address, "pwd", function(returnData){
        if(returnData.success){
            if(returnData.output.length > 0){ //output has some invisible char at the end!
                sshList[client_ip_address].baseDir = returnData.output.substring(0, returnData.output.length - 1);
                returnData.pwd = getPWDString(client_ip_address);
            }
            cb(returnData);
        } else {
            cb(returnData);
        }
    });
}

const getPWDString = function(client_ip_address){
    return sshList[client_ip_address].user + "@" + sshList[client_ip_address].host + ":" + sshList[client_ip_address].baseDir;
}

/*NAMESPACES***********************************************************************************************************/
var ssh_io = io.of('/ssh');
ssh_io.on('connection', function(socket){
    var client_ip_address = socket.request.connection.remoteAddress;
    lgr.log("ssh_io(" + client_ip_address + ") logged on!");

    //Connect to SSH - Host should always be the current Server hosting the Website //TODO add Host!
    socket.on('login', function(data){
        //TODO check for error
        lgr.log("ssh_io(" + client_ip_address + ") login with data...");
        if(false){ //FIXME if(sshList[client_ip_address] != null){ //to prevent the page refresh problem
            socket.emit('login', sshResult(false, "Error! Already Logged in."));
        } else {

            let sshOjb = SSH(data); //TODO check if correctly connected? where is the fail case?

            sshOjb.start({
                success: function(){
                    lgr.log("SSH Login(" + client_ip_address + ") Success");
                    sshList[client_ip_address] = sshOjb;
                    socket.emit('login', sshResult(true, "Login successful!"));
                },
                fail: function(err){
                    lgr.log("SSH Login(" + client_ip_address + ") Error: " + err);
                    socket.emit('login', sshResult(false, "Error! Check the Username or Password."));
                }
            });
        }
    });

    socket.on('logout', function(data){
        //TODO check for error
        lgr.log("SSH Logout(" + client_ip_address + ") logout");

        if(sshList[client_ip_address] != null){
            sshList[client_ip_address].end();
            delete sshList[client_ip_address];

            socket.emit('logout', sshResult(true, "Logout successful!"));
        } else {
            socket.emit('logout', sshResult(false, "Client was not logged in!"));
        }


    });

    socket.on('sshExec', function(command){
        //bugfix for now
        if(command.toLocaleLowerCase() == "cd" || command.toLowerCase() == "cd "){
            return;
        }

        if(sshList[client_ip_address] == null || command == null || command == undefined){
            lgr.log("sshExec(" + client_ip_address + ") no SSH Session found!");
            socket.emit('sshExec', sshResult(false, "No SSH Session found! Please Login again."));
        } else {
            if(command.substring(0, 3) == "cd "){
                let path = command.substring(3, command.length);
                changeDirectory(client_ip_address, path, function(returnData){
                    socket.emit('sshExec', returnData);
                });
            } else {
                executeCommand(client_ip_address, command, function(returnData){
                    socket.emit('sshExec', returnData);
                });
            }
        }
    });
});

/* Manager Namepsace(/manager)
 *   init
 */
// var manager = io.of('/manager');
// manager.on('connection', function(socket){
//     var client_ip_address = socket.request.connection.remoteAddress;
//     lgr.log("Manager(" + client_ip_address + ") logged on!");
//     //Init - get current connected TF devices
//     socket.on('init', function(){
//         sendDevicesToClient(socket);
//         //socket.emit('init', data); //Emits directly to the socket
//         //manager.emit('init', data); //Emit to ALL subscribed sockets
//
//     })
// });
/*EXPORTS**************************************************************************************************************/
module.exports.init = function(server){
    if(server === undefined){
        lgr.logErr("Socket.io could not be initialized! Server was given undefined!")
        return;
    }
    io.listen(server);
    lgr.log("Socket.io listening.");
}