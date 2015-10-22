var weather = function () {
    "use strict";

    var init = function (options) {
        $.getJSON("weather.ashx?callback=?", function (data) {
            $("#currentTemperature").html(data.CurrentTemperature + "&deg;");
            $("#precis").html(data.Precis);

            $.each(data.Forecasts, function (index, forecast) {
                $("#forecastTmpl").tmpl(forecast).appendTo("#forecasts");
            });

            //setChart();

        });
    };

    var setWindowsPhoneTileImage = function(){
        document.body.style.margin = '0px'; 
        document.body.style.padding = '0px'; 
        document.body.style.border = 'none'; 
        document.body.style.fontSize = 'medium'; 
        document.body.style.color = '#000'; 
        document.body.style.backgroundColor = '#fff';   
        document.body.innerHTML=' <img src="images/3.png" style="padding:0px;margin:0px;width:100%"/> <p style="margin:10px">stop the loading + pin to start<\/p> '; 
    }

    var setChart = function () {
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: "container",
                defaultSeriesType: "area",
                margin: [0, 0, 0, 0]
            },
            title: {
                text: ""
            },
            credits: {
                enabled: false
            },
            xAxis: {
                labels: {
                    enabled: false
                }
            },
            yAxis: {
                maxPadding: 0,
                minPadding: 0,
                endOnTick: false,
                labels: {
                    enabled: false
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    marker: {
                        //enabled:false,
                        radius: 1,
                        states: {
                            hover: {
                                radius: 2
                            }
                        }
                    }
                }
            },
            series: [{
                color: "#666",
                fillColor: "rgba(255,96,48,1)",
                data: getSeries(data.Observations, "AirTemperature")
            },
                {
                    color: "#000",
                    fillColor: "rgba(64,96,204,.5)",
                    data: getSeries(data.Observations, "RelativeHumidity")
                }
            //                ,{
            //                    color: "#666",
            //                    fillColor: "rgba(64,255,52,.25)",
            //                    data: getSeries(data.Observations, "Pressure")
            //                }

                ]
        });
    };

    var getSeries = function (obs, series) {
        var result = [];
        $.each(obs, function (k, v) {
            result.push(v[series]);
        });
        return result;
    };

    init();



    return {
        init: init,
        setTile: setWindowsPhoneTileImage
        // expose more public methods
    };
} ();