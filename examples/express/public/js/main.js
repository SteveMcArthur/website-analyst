/*global Chart, document, window*/ ! function ($) {
    "use strict";
    var globalDefaults = {
        responsive: true
    };
    //Chart.defaults.global = globalDefaults;

    function createChart(data, canvasId, type) {
        var opts = {};
        opts.type = type || 'bar';
        opts.data = data;
        var el = document.getElementById(canvasId);
        var ch = new Chart(el, opts);
        return ch;
    }

    function createPie(data, canvasId, type) {
        var labels = [];
        var values = [];
        var backgroundColors = [];
        var hoverColors = [];
        var i;
        for (i = 0; i < data.length; i++) {
            labels.push(data[i].label);
            values.push(data[i].value);
            backgroundColors.push(data[i].color);
            hoverColors.push(data[i].highlight);
        }
        var pieData = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverColors
            }]
        };
        createChart(pieData, canvasId, "pie");
    }

    $.ajax({
        dataType: "json",
        url: window.location.pathname,
        data: {
            data: "z1"
        },
        success: function (data) {
            createChart(data.yearVisitors, "yearChartVisitors");
            createChart(data.progressVisitors, "progressVisitors", "line");
            createPie(data.browserPopularity, "browserPopularity");
            createPie(data.osPopularity, "osPopularity");
            createPie(data.langPopularity, "langPopularity");
            createChart(data.weekVisitors, "weekChartVisitors");
            createPie(data.topRoutes, "routePopularity");
        }
    });
    $.ajax({
        dataType: "json",
        url: window.location.pathname,
        data: {
            data: "z2"
        },
        success: function (data) {
            var temp;
            var output = [];
            var prop;
            for (prop in data) {
                temp = [];
                temp.push(prop);
                temp.push(data[prop]);
                output.push(temp);
            }
            $("#table-referrers").DataTable({
                paging: true,
                ordering: false,
                info: false,
                data: output
            });
        }
    });
    $.ajax({
        dataType: "json",
        url: window.location.pathname,
        data: {
            data: "z3"
        },
        success: function (data) {
            var temp;
            var output = [];
            var prop;
            for (prop in data) {
                temp = [];
                temp.push(prop);
                temp.push(data[prop]);
                output.push(temp);
            }
            $("#table-keywords").DataTable({
                paging: true,
                ordering: false,
                info: false,
                data: output
            })
        }
    })
}(jQuery);