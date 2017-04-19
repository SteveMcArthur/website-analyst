/*global require, describe, before, it, __dirname, console*/
var assert = require('assert');
var path = require('path');
var TextAdapter = require('../textadapter');
var startDate = new Date("Fri Apr 14 2017");
var dataDir = path.join(__dirname, 'data');
console.log(TextAdapter);
var adapter;
before(function (done) {
    adapter = new TextAdapter(dataDir, startDate, function () {
        done();
    });
});


describe('textadapter', function () {
    it('should have a dataTable property', function (done) {

        console.log("dataTable length: " + adapter.dataTable.length);
        assert.ok(adapter.dataTable.length > 0, "dataTable has data");
        done();
    });
    it('should have a dataTable length of 522', function (done) {
        assert.equal(adapter.dataTable.length, 522, "dataTable length is 522");
        done();
    });
    it('should return visitors per day', function (done) {
        var visitorsPerDay = adapter.visitorAggregateByDay();
        assert.equal(visitorsPerDay.length, 32, "routeAggregateByDay returns data");
        done();
    });

    it('should return routes per day', function (done) {
        var routesPerDay = adapter.routeAggregateByDay();
        assert.equal(routesPerDay.length, 32, "routeAggregateByDay returns data");
        done();
    });

    it('should return languages per day', function (done) {
        var langsPerDay = adapter.languageAggregateByDay();
        assert.equal(langsPerDay.length, 32, "languageAggregateByDay returns data");
        done();
    });

    it('should return OS per day', function (done) {
        var osPerDay = adapter.osAggregateByDay();
        assert.equal(osPerDay.length, 32, "osAggregateByDay returns data");
        done();
    });

    it('should return browsers per day', function (done) {
        var browsersPerDay = adapter.browserAggregateByDay();
        assert.equal(browsersPerDay.length, 32, "browserAggregateByDay returns data");
        done();
    });

    it('should return visitors to each route over 7 day period', function (done) {
        var routes7day = adapter.routeAggregate();
        console.log(routes7day);
        assert.equal(routes7day.length, 2, "routeAggregate returns data");
        done();
    });





});