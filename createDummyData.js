/*global console, require, __dirname*/
var fs = require('fs');
var path = require('path');
var ONE_DAY = 1000 * 60 * 60 * 24;


var dataDir = path.join(__dirname, 'data');

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function subtractDays(theDate, days) {
    var days_ms = ONE_DAY * days;
    var ms = theDate.getTime() - days_ms;
    var outDate = new Date(ms);
    return outDate;
}


function generateIp() {
    var tempArr = [randomInt(120, 188), randomInt(0, 255), randomInt(0, 255), randomInt(3, 189)];
    var ip = tempArr.join(".");
    return ip;
}

var routes = ["/", "/", "/", "/blog", "/my-page", "/my-page", "/my-other-page"];

function generateURL() {
    return routes[randomInt(0, 6)];
}

var os = ["Windows", "Mac OS", "Linux", "Windows"];

function generateOS() {
    return os[randomInt(0, 3)];
}
var browsers = ["Firefox", "Chrome", "Chrome", "IE", "IE", "Safari"];

function generateBrowser() {
    return browsers[randomInt(0, 5)];
}
var languages = ["en-US", "en-US", "en-GB", "ru", "zh"];

function generateLanguage() {
    return languages[randomInt(0, 4)];
}

var lastVis;
var visCount = 0;
var visRepeat = 7;

function generateVisitor() {
    visCount++;
    var vis;
    //put some repetition in the visitor records
    if (visCount > 5) {
        vis = lastVis;
    } else {
        vis = {
            ip: generateIp(),
            browser: generateBrowser(),
            os: generateOS(),
            lang: generateLanguage()
        }
    }
    if (visCount > visRepeat) {
        visCount = 0;
        visRepeat = randomInt(6, 10);
    }
    lastVis = vis;
    return vis;
}
/*
[
    "date", "headers", "host", "referer", "os", "osVer", "browser", "browserVer",
    "language", "url", "method", "ip", "ip2", "hostname", "originalUrl",
    "params", "path", "protocol", "query", "route"
];
*/
function makeRecord(dateStr) {
    var output = [dateStr];
    var visitor = generateVisitor();
    var url = generateURL();
    output.push("", "example.com", "", visitor.os, "", visitor.browser, "", visitor.lang, url);
    output.push("GET", visitor.ip, visitor.ip, "example.com", url, "", url, "http", "", url);
    return output;

}

function makeFileName(now) {
    var arr = [now.getFullYear(), now.getMonth()];
    var filename = arr.join("-") + ".txt";
    return filename;
}

function saveRecord(rec, filename, callback) {
    var filePath = path.join(dataDir, filename);
    var outputTxt = rec.join("|") + "\n";
    fs.appendFile(filePath, outputTxt, 'utf8', function (err) {
        if (err) {
            console.error(err);
        } else {
            callback();
        }
    });
}

var now = new Date();

var i = 0;
var days = 0;
var usedRandom = false;
var currentDate = now.toString();
var filename = makeFileName(now);
var rec;
var num;
var startNum = 100;
var numberBase = startNum;
var deIncrement = 10;

function recordGenerator() {
    i++;
    if ((i > numberBase) && (!usedRandom)) {
        i = numberBase - randomInt(0, numberBase);
        console.log(currentDate);
        num = numberBase + i;
        console.log("Number records: " + num);
        usedRandom = true;
    } else if (i > numberBase) {
        now.setTime(now.getTime() - ONE_DAY);
        currentDate = now.toString();
        console.log("CurrentDate set to: " + currentDate);
        filename = makeFileName(now);
        days++;
        usedRandom = false;
        numberBase = numberBase - deIncrement;
        if (numberBase < (2 * deIncrement)) {
            numberBase = startNum;
        }
        i = 0;
    }

    if (days > 31) {
        console.log("Got 30 days - leaving now...");
    } else {
        rec = makeRecord(currentDate);
        saveRecord(rec, filename, recordGenerator);
    }
}

recordGenerator();