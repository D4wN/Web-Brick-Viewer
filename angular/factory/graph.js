"use strict";

var angApp = angular.module('wbv');

angApp.factory('Graph', ['$log', '$timeout', '$rootScope', 'PollingValueTimer', function($log, $timeout, $rootScope, PollingValueTimer){
    // function Graph(id, valueData, device, interval = 50, unitFactor = 1, label = "Value"){
    function Graph(id, device, graphConfigs, interval = 50){
        this.debug_name = "[Graph|" + id + "]"
        this.ele = null;
        this.eleName = id;
        this.interval = interval;
        this.graphConfigs = graphConfigs;

        this.data = {}; //init data - for each graphConfig
        this.dataMaxSize = 200; //last 10 seconds of data (1000ms * 10 = -> 50ms * 200 ) TODO make dynamic (interval <=> time to log)
        this.plot = null;
        this.timer = [];


        let that = this;
        this.graphConfigs.forEach(function(object, index){


            that.data[that.graphConfigs[index].label] = {};
            that.data[that.graphConfigs[index].label].data = [];
            that.data[that.graphConfigs[index].label].color = that.graphConfigs[index].color;



            that.timer.push(new PollingValueTimer(interval, that.graphConfigs[index].valueData['getter'], device, that.graphConfigs[index].valueData['args'], function(value){
                that.addValue(value / that.graphConfigs[index].unitFactor, that.graphConfigs[index].label);
            }));
        });
    }

    Graph.prototype.start = function(){
        $log.log(this.debug_name + "start()");

        let that = this;
        $timeout(function(){
            //Loads after DOM is loaded. src: http://stackoverflow.com/a/22541080
            that.ele = angular.element("#" + that.eleName);
            if(!that.ele.length){
                that.ele = null;
                $log.warn(that.debug_name + "#" + that.eleName + " Element not found!");
                return;
            }

            let flotData = that.getData();
            //src: http://www.jqueryflottutorial.com/how-to-make-jquery-flot-realtime-update-chart.html
            let flotOptions = {
                series: {
                    lines: {
                        show: true,
                        lineWidth: 1,
                        // shadowSize: 0,
                        fill: false
                    }
                },
                xaxis: {
                    mode: "time",
                    tickSize: [5, "second"],
                    tickFormatter: function(v, axis){
                        var date = new Date(v);
                        if(date.getSeconds() % 5 == 0){
                            var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                            var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                            return hours + ":" + minutes + ":" + seconds;
                        } else {
                            return "";
                        }
                    },
                    axisLabel: "Time",
                    axisLabelUseCanvas: true
                },
                yaxis: {
                    axisLabel: "Value",
                    axisLabelUseCanvas: true
                }
            };
            that.plot = $.plot(that.ele, flotData, flotOptions);

            that.timer.forEach(function(t, index){
                t.start();
            });
        });
    }

    Graph.prototype.stop = function(){
        this.timer.forEach(function(t, index){
            t.stop();
        });
    }

    Graph.prototype.addValue = function(value, label){
        // $log.log(this.debug_name + "addValue()");
        if(!this.ele){
            $log.warn(this.debug_name + "addValue() - Element was null");
            return;
        }

        let now = new Date().getTime();
        //search for the right DATA element
        this.data[label].data.push([now, value]);

        if(this.data[label].data.length > this.dataMaxSize){
            this.data[label].data.shift();
        }

        this.update();
    }

    Graph.prototype.getData = function(){
        let flotData = [];
        //for each element in key, value
        for(let key in this.data){
            // let key = this.graphConfigs[0].label

            // $log.log()

            let value = this.data[key].data;
            let color = this.data[key].color;

            flotData.push({
                label: key,
                data: value,
                color: color
            });
        }

        return flotData;
    }

    Graph.prototype.update = function(){
        // $log.log(this.debug_name + "update()");
        if(!this.ele){
            $log.warn(this.debug_name + "update() - Element was null");
            return;
        }

        let flotData = this.getData();

        this.plot.setData(flotData);
        this.plot.setupGrid();
        this.plot.draw();
    }

    return Graph;
}]);

angApp.factory('GraphConfig', ['$log', function($log){
    function GraphConfig(label, valueData, unitFactor = 1, color = "#edc240"){
        this.debug_name = "[GraphConfig|" + label + "]";

        this.label = label;
        this.valueData = valueData;
        this.unitFactor = unitFactor;
        this.color = color;
    }

    GraphConfig.prototype.validate = function(){
        let ret = true;

        if(this.label === null || this.label === undefined){
            $log.log(this.debug_name + " Label was null or undefined!");
            ret = false;
        }

        if(this.valueData === null || this.valueData === undefined){
            $log.log(this.debug_name + " ValueData was null or undefined!");
            ret = false;
        }

        //TODO check if number -> WBVUtil
        if(this.unitFactor === null || this.unitFactor === undefined){
            $log.log(this.debug_name + " UnitFactor was null or undefined!");
            ret = false;
        }

        if(this.color === null || this.color === undefined){
            $log.log(this.debug_name + " Color was null or undefined!");
            ret = false;
        }

        return ret;
    }

    return GraphConfig;
}]);