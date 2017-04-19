/*global require, __dirname, module, console, setTimeout, clearTimeout*/
var RequestLogger = require('./requestLogger');
var TextAdapter = require('./textadapter');
var path = require('path');

function log(message) {
    console.log(message);
}

function debug(isDebug, message) {
    if (isDebug) {
        log(message);
    }
}

function StatsEngine(options) {
    var dataDir = options.dataDir || path.join(__dirname, 'data');
    this.adapter = options.adapter || new TextAdapter(dataDir);
    this.requestLogger = new RequestLogger(options);
}

StatsEngine.prototype.parse = function (req) {
    this.requestLogger.parse(req);
};

StatsEngine.prototype.getData = function () {
    return this.requestLogger.currentData;
};


StatsEngine.prototype.uniqueVisitorsPerDay = function () {
    return this.adapter.visitorAggregateByDay();
};
StatsEngine.prototype.uniqueVisitorsPerMonth = function () {
    return this.adapter.visitorAggregateByMonth();
};
StatsEngine.prototype.uniqueVisitorsProgression = function () {

};
StatsEngine.prototype.browserShare = function () {
    return this.adapter.browserSum(30);
};
StatsEngine.prototype.osShare = function () {
    return this.adapter.osSum(30);
};

StatsEngine.prototype.langShare = function () {
    return this.adapter.langSum(30);
};
StatsEngine.prototype.routeShare = function () {
    return this.adapter.routeSum(30);
};

StatsEngine.prototype.refererFrequency = function () {
    return this.adapter.refererSum(30);
};

StatsEngine.prototype.keywordFrequency = function () {
    return this.adapter.keywordSum(30);
};

module.exports = StatsEngine;