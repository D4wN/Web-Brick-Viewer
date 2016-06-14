function SimpleLogger(prefix){
    if(prefix == null || prefix === undefined)
        this.prefix = "";
    else
        this.prefix = "[" + prefix + "]";
};

SimpleLogger.prototype.log = function(msg){
    console.log(this.prefix + msg);
};

SimpleLogger.prototype.logErr = function(msg){
    console.error(this.prefix + msg);
}

SimpleLogger.prototype.logRaw = function(msg){
    console.log(msg);
}

module.exports = SimpleLogger