! function (t) {
    "use strict";
    var e, o, a, i, n, l, s, r;
    Chart.defaults.global = {
        animation: !0,
        animationSteps: 60,
        animationEasing: "easeOutQuart",
        showScale: !0,
        scaleOverride: !1,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: "rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: !0,
        scaleLabel: "<%=value%>",
        scaleIntegersOnly: !0,
        scaleBeginAtZero: !1,
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        responsive: !1,
        maintainAspectRatio: !0,
        showTooltips: !0,
        customTooltips: !1,
        tooltipEvents: ["mousemove", "touchstart", "touchmove"],
        tooltipFillColor: "rgba(0,0,0,0.8)",
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipFontSize: 14,
        tooltipFontStyle: "normal",
        tooltipFontColor: "#fff",
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipTitleFontSize: 14,
        tooltipTitleFontStyle: "bold",
        tooltipTitleFontColor: "#fff",
        tooltipYPadding: 6,
        tooltipXPadding: 6,
        tooltipCaretSize: 8,
        tooltipCornerRadius: 6,
        tooltipXOffset: 10,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
        multiTooltipTemplate: "<%= value %>",
        onAnimationProgress: function () {},
        onAnimationComplete: function () {}
    }, Chart.defaults.global.responsive = !0, e = {
        scaleShowGridLines: !0,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        scaleShowHorizontalLines: !0,
        scaleShowVerticalLines: !0,
        bezierCurve: !0,
        bezierCurveTension: .4,
        pointDot: !0,
        pointDotRadius: 4,
        pointDotStrokeWidth: 1,
        pointHitDetectionRadius: 20,
        datasetStroke: !0,
        datasetStrokeWidth: 2,
        datasetFill: !0,
        legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    }, o = function (t, o) {
        var a;
        o = o || e, a = document.getElementById("yearChartVisitors").getContext("2d"), new Chart(a).Bar(t, o)
    }, a = function (t, o) {
        var a;
        o = o || e, a = document.getElementById("weekChartVisitors").getContext("2d"), new Chart(a).Bar(t, o)
    }, i = function (t, o) {
        var a;
        o = o || e, a = document.getElementById("progressVisitors").getContext("2d"), new Chart(a).Line(t, o)
    }, n = function (t, o) {
        var a;
        o = o || e, a = document.getElementById("browserPopularity").getContext("2d"), new Chart(a).Pie(t, o)
    }, l = function (t, o) {
        var a;
        a = document.getElementById("osPopularity").getContext("2d"), o = o || e, new Chart(a).Pie(t, o)
    }, s = function (t, o) {
        var a;
        a = document.getElementById("langPopularity").getContext("2d"), o = o || e, new Chart(a).Pie(t, o)
    }, r = function (t, o) {
        var a;
        o = o || e, a = document.getElementById("routePopularity").getContext("2d"), new Chart(a).Pie(t, o)
    }, t.ajax({
        dataType: "json",
        url: window.location.pathname,
        data: {
            data: "z1"
        },
        success: function (t) {
            o(t.yearVisitors), i(t.progressVisitors), n(t.browserPopularity), l(t.osPopularity), s(t.langPopularity), a(t.weekVisitors), r(t.topRoutes)
        }
    }), t.ajax({
        dataType: "json",
        url: window.location.pathname,
        data: {
            data: "z2"
        },
        success: function (e) {
            var o, a, i;
            a = [];
            for (o in e) i = [], i.push(o), i.push(e[o]), a.push(i);
            t("#table-referrers").DataTable({
                paging: !0,
                ordering: !1,
                info: !1,
                data: a
            })
        }
    }), t.ajax({
        dataType: "json",
        url: window.location.pathname,
        data: {
            data: "z3"
        },
        success: function (e) {
            var o, a, i;
            a = [];
            for (o in e) i = [], i.push(o), i.push(e[o]), a.push(i);
            t("#table-keywords").DataTable({
                paging: !0,
                ordering: !1,
                info: !1,
                data: a
            })
        }
    })
}(jQuery);