/*global require, __dirname, module, console, setTimeout, clearTimeout*/
var fs = require('fs');
var path = require('path');
var UAParser = require('ua-parser-js');
var fileExists = require("file-exists");
var merge = require('merge'); // Lazy mode

var parser = new UAParser();

function log(message) {
    console.log(message);
}

function debug(isDebug, message) {
    if (isDebug) {
        log(message);
    }

}



function RequestLogger(options) {
    var defaultOptions = {
        ignoreIPs: [],
        ignoreRoutes: [],
        ignoreExtensions: [],
        dataDir: __dirname,
        route: 'stats',
        testMode: false,
        debugMode: false,
        frequency: 10000
    };
    this.userOptions = merge(defaultOptions, options);
    this.init();
}
RequestLogger.prototype.syncData = function () {
    //save any unsaved data before settingCurrentDate
    //as we may have unsaved data from the previous day
    if (this.currentFilePath && this.dirty) {
        this.saveData();
        if (this.saveTimeout) {
            clearTimeout(this.lastTimeout);
        }
    }
    this.setCurrentDate();
    if (!fileExists(this.currentFilePath)) {
        this.currentData = [];
        this.saveData();
    }
};

RequestLogger.prototype.makeIndex = function (now) {
    var arr = [now.getFullYear(), now.getMonth()];
    if (this.userOptions.saveLogByDay) {
        arr.push(now.getDate());
    }

    var index = arr.join("-");
    return index;
};

RequestLogger.prototype.setCurrentDate = function () {
    var now = new Date();
    this.currentDate = now;
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
    this.currentDay = now.getDate();
    this.currentIndex = this.makeIndex(now);
    this.currentFilename = this.currentIndex + ".txt";
    this.currentFilePath = path.join(this.userOptions.dataDir, this.currentFilename);
    var night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var msToMidnight = night.getTime() - now.getTime();
    var self = this;
    if (this.dateTimeout) {
        clearTimeout(this.dateTimeout);
    }
    this.dateTimeout = setTimeout(function () {
        debug(self.userOptions.debugMode, "Midnight called: " + now.toString());
        self.syncData();
    }, msToMidnight);
};

RequestLogger.prototype.init = function () {
    this.syncData();

};

var getStats = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    var userAgent = req.headers['user-agent'];
    var uaInfo = parser.setUA(userAgent).getResult();
    var stats = {
        host: req.headers.host,
        referer: req.headers.referer,
        os : uaInfo.os.name,
        osVer: uaInfo.os.version,
        browser:  uaInfo.browser.name,
        browserVer: uaInfo.browser.version,
        language: req.headers['accept-language'],
        url: req.url,
        method: req.method,
        ip: ip,
        ip2: req.ip,
        hostname: req.hostname,
        originalUrl: req.originalUrl,
        params: req.params,
        path: req.path,
        protocol: req.protocol,
        query: req.query,
        route: req.route
    };

    return stats;

};

RequestLogger.prototype.parse = function (req) {

    var now = new Date();
    var dataVisitor = getStats(req);

    var debugMode = this.userOptions.debugMode;
    var i;

    // Ignore list: routes
    var ignoreRoutes = this.userOptions.ignoreRoutes;
    for (i = 0; i < ignoreRoutes.length; ++i) {
        if (dataVisitor.url.indexOf(ignoreRoutes[i]) > -1) {
            debug(debugMode, 'Ignoring route: ' + ignoreRoutes[i])
            return;
        }
    }

    var ignoreIPs = this.userOptions.ignoreIPs;
    for (i = 0; i < ignoreIPs.length; ++i) {
        if (dataVisitor.ip.indexOf(ignoreIPs[i]) > -1) {
            debug(debugMode, 'Ignoring IP: ' + ignoreIPs[i]);
            return;
        }
    }

    var ignoreExtensions = this.userOptions.ignoreExtensions;
    for (i = 0; i < ignoreExtensions.length; ++i) {
        if (dataVisitor.url.indexOf(ignoreExtensions[i]) > -1) {
            debug(debugMode, 'Ignoring Extension: ' + ignoreExtensions[i] + "(" + dataVisitor.url + ")");
            return;
        }
    }

    var outputArray = [now.toString()];
    var prop;
    for (prop in dataVisitor) {
        outputArray.push(dataVisitor[prop]);
    }

    this.currentData.push(outputArray);
    this.dirty = true;
};

RequestLogger.prototype.saveDataMetered = function () {
    var self = this;
    if (self.dirty) {
        if (self.saveTimeout) {
            clearTimeout(self.lastTimeout);
        }
        self.saveTimeout = setTimeout(function () {
            self.saveData();
        }, self.userOptions.frequency);
    }
};

RequestLogger.prototype.saveData = function () {
    var self = this;
    var outputTxt = "";
    var i;
    for (i = 0; i < this.currentData.length; i++) {
        outputTxt += this.currentData[i].join("|") + "\n";
    }
    fs.appendFile(this.currentFilePath, outputTxt, function (err) {
        if (err) {
            console.error(err);
        } else {
            self.dirty = false;
            debug(self.userOptions.debugMode, "File saved: " + self.currentFilePath);
        }
    });
};

module.exports = RequestLogger;