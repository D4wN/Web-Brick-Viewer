"use strict";

var angApp = angular.module('wbv');

angApp.factory('Graph', ['$log', '$timeout', '$rootScope', 'PollingValueTimer', function($log, $timeout, $rootScope, PollingValueTimer){
    function Graph(id, valueData, device, interval = 50, unitFactor = 1, label = "Value"){
        this.debug_name = "[Graph|" + id + "]"
        this.ele = null;
        this.eleName = id;
        this.interval = interval;
        this.unitFactor = unitFactor

        this.label = label;
        this.data = []; //x,y
        this.dataMaxSize = 200; //last 10 seconds of data (1000ms * 10 = -> 50ms * 200 )
        this.plot = null;


        let that = this;
        this.timer = new PollingValueTimer(interval, valueData['getter'], device, valueData['args'], function(value){
            that.addValue(value / that.unitFactor);
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

            let flotData = [{
                label: that.label,
                data: that.data
            }];
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
            that.timer.start();
        });
    }

    Graph.prototype.stop = function(){
        this.timer.stop();
    }

    Graph.prototype.addValue = function(value){
        // $log.log(this.debug_name + "addValue()");
        if(!this.ele){
            $log.warn(this.debug_name + "addValue() - Element was null");
            return;
        }

        let now = new Date().getTime();
        this.data.push([now, value]);

        if(this.data.length > this.dataMaxSize){
            this.data.shift();
        }

        this.update();
    }

    Graph.prototype.update = function(){
        // $log.log(this.debug_name + "update()");
        if(!this.ele){
            $log.warn(this.debug_name + "update() - Element was null");
            return;
        }

        let flotData = [{
            label: this.label,
            data: this.data
        }];

        this.plot.setData(flotData);
        this.plot.setupGrid();
        this.plot.draw();
    }

    return Graph;
}]);
