/*global require, console, __dirname, JSON*/
var TextAdapter = require('./textadapter');
var q = require('json-query');
var fs = require('fs');
var path = require('path');
var startDate = new Date("Sun Apr 16 2017");
var dataDir = path.join(__dirname, 'data');
var adapter;



function afterLoaded() {
    console.log("data loaded..");
    console.log("Number of rows: " + adapter.dataTable.length);
    var dataTable = adapter.dataTable;
    //var result = q('[[*0=2017-04-16T18:12:00.000Z]]', dataTable);
    //fs.writeFileSync("result.json", JSON.stringify(result, null, 4));
    var routeAggregateByDay = adapter.routeAggregateByDay();
    var routes7day = adapter.routeSum(7);
    fs.writeFileSync("dataTable.json", JSON.stringify(dataTable, null, 4));
    fs.writeFileSync("routeAggregateByDay.json", JSON.stringify(routeAggregateByDay, null, 4));
    fs.writeFileSync("routes7day.json", JSON.stringify(routes7day, null, 4));
    //console.log("Number of visitors found: " + routes7day.rows.length);
}

adapter = new TextAdapter(dataDir, startDate, afterLoaded);