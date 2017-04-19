/*global require, __dirname, module, console*/
var fs = require('fs');
var path = require('path');
var LineByLineReader = require('linebyline');
var fileExists = require("file-exists");
var ONE_DAY = 1000 * 60 * 60 * 24;

function isDate(obj) {
    //no need to check for null or undefined - these will return false
    return Object.prototype.toString.call(obj) === "[object Date]";
}

function days_between(date1, date2) {

    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    //make the difference calculation inclusive - ie
    //includes the two dates passed in the calculation.
    //So Sun 9 - Sat 15 is 7 days
    //Sun 9, Mon 10, Tue 11, Wed 12, Thur 13, Fri 14, Sat 15
    var difference_ms = Math.abs(date1_ms - date2_ms) + ONE_DAY;
    return Math.round(difference_ms / ONE_DAY);
}

function subtractDays(theDate, days) {
    var days_ms = ONE_DAY * days;
    var ms = theDate.getTime() - days_ms;
    var outDate = new Date(ms);
    return outDate;
}

function TextAdapter(dataDir, startDate, callback) {
    console.log("TextAdapter constructor called..")
    this.dataDir = dataDir;
    this.dataTable = [];
    this.lineDelimiter = "|";
    this.columnNames = [
        "date", "headers", "host", "referer", "os", "osVer", "browser", "browserVer",
        "language", "url", "method", "ip", "ip2", "hostname", "originalUrl",
        "params", "path", "protocol", "query", "route"
    ];

    //this is mainly for testing purposes
    if (isDate(startDate)) {
        this.now = startDate;
    }
    var dt = this.now || new Date();
    var month = dt.getMonth();
    var year = dt.getFullYear();
    var filename = year + "-" + month + ".txt";
    this.loadData(filename, 30, callback);

}

TextAdapter.prototype.addRow = function (line) {
    var arr = line.split(this.lineDelimiter);
    var dateStr = arr[0];
    arr[0] = new Date(dateStr);
    this.dataTable.push(arr);
};

/*returns object in the form of:
*   [
        ["Wed Jul 26 2017", "/", 3000],
        ["Wed Jul 26 2017", "/blog", 2500],
        ["Wed Jul 26 2017", "/my-something", 6700]
        ["Tue Jul 25 2017","/", 3240],
        ["Tue Jul 25 2017","/blog", 2308],
        ["Tue Jul 25 2017","/my-something", 5937]
    ]
*/
TextAdapter.prototype.aggregateByField = function (fieldName) {
    var output = {};
    var outArray = [];
    var currentDate;
    var checkList = [];
    var i, dt, dtStr, ip, val, checkVal, prop, item;
    for (i = 0; i < this.dataTable.length; i++) {
        dt = this.dataTable[i][this.columnNames.indexOf("date")];
        dtStr = dt.toDateString();
        ip = this.dataTable[i][this.columnNames.indexOf("ip")];
        val = this.dataTable[i][this.columnNames.indexOf(fieldName)];
        checkVal = ip + val;
        //check if we are on the same day
        if (dtStr === currentDate) {
            //check if it is unique visitor for the field
            if (checkList.indexOf(checkVal) === -1) {
                output[dtStr][val] = output[dtStr][val] ? output[dtStr][val] + 1 : 1;
                checkList.push(checkVal);
            }
        } else {
            item = output[currentDate];
            for (prop in item) {
                outArray.push([currentDate, prop, item[prop]]);
            }
            currentDate = dtStr;
            checkList = [];
            output[dtStr] = {};
            output[dtStr][val] = 1;
            checkList.push(checkVal);
        }
    }

    return outArray;
};
//gets a count of unique ips (visitors) per day
TextAdapter.prototype.visitorAggregateByDay = function () {
    return this.aggregateByField("ip");
};
//Gets a count of visitors to each route on each day.
TextAdapter.prototype.routeAggregateByDay = function () {
    return this.aggregateByField("route");
};
//Gets a count of each language on each day.
TextAdapter.prototype.languageAggregateByDay = function () {
    return this.aggregateByField("language");
};
//Gets a count of each OS on each day.
TextAdapter.prototype.osAggregateByDay = function () {
    return this.aggregateByField("os");
};
//Gets a count of each browser on each day.
TextAdapter.prototype.browserAggregateByDay = function () {
    return this.aggregateByField("browser");
};
//Gets a count of each referer on each day.
TextAdapter.prototype.refererAggregateByDay = function () {
    return this.aggregateByField("referer");
};
//Gets a count of each referer on each day.
TextAdapter.prototype.keywordAggregateByDay = function () {
    return this.aggregateByField("keyword");
};


//over x number of days we should have totals for a particular
//field for the entire period. Data passed has already been
//aggregated by calling the appropriate aggregate function
//for the particular field (eg browserAggregateByDay)
//Input data should be in the form [date, fieldValue,count]
//Output data should be in the form [fieldValue,count]
TextAdapter.prototype.sumOverPeriod = function (data, days) {
    days = days || 7;
    var now = this.now || new Date();
    var output = [];
    var temp = {};
    var dt, currentDate, testDate, item, p, i, dayDiff, prop, val;
    for (i = 0; i < data.length; i++) {
        //check to see if we have exceeded the number of days
        dt = data[i][0];
        if (currentDate !== dt) {
            testDate = new Date(dt);
            dayDiff = days_between(testDate, now);
            console.log(testDate.toDateString() + " - " + now.toDateString());
            console.log(dayDiff);
            if (dayDiff > days) {
                break;
            }
            currentDate = dt;
            console.log("currentDate set: " + currentDate);
        }

        item = data[i];
        prop = item[1];
        val = item[2];
        temp[prop] = temp[prop] ? temp[prop] + val : val;
    }

    //convert to array. This is more suitable
    //for things like chart.js
    for (prop in temp) {
        output.push([prop, temp[prop]]);
    }

    return {
        startDate: now.toDateString(),
        endDate: currentDate,
        rows: output
    };

};

TextAdapter.prototype.visitorSum = function (days, data) {
    data = data || this.visitorAggregateByDay();
    return this.sumOverPeriod(data, days);
};

//gets a count of unique routes per day
TextAdapter.prototype.routeSum = function (days, data) {
    data = data || this.routeAggregateByDay();
    return this.sumOverPeriod(data, days);
};

TextAdapter.prototype.languageSum = function (days, data) {
    data = data || this.languageAggregateByDay();
    return this.sumOverPeriod(data, days);

};
TextAdapter.prototype.osSum = function (days, data) {
    data = data || this.osAggregateByDay();
    return this.sumOverPeriod(data, days);
};
TextAdapter.prototype.browserSum = function (days, data) {
    data = data || this.browserAggregateByDay();
    return this.sumOverPeriod(data, days);
};
TextAdapter.prototype.refererSum = function (days, data) {
    data = data || this.refererAggregateByDay();
    return this.sumOverPeriod(data, days);
};
TextAdapter.prototype.keywordSum = function (days, data) {
    data = data || this.keywordAggregateByDay();
    return this.sumOverPeriod(data, days);
};

TextAdapter.prototype.aggregateByMonth = function (data) {
    var currentMonth, i, month, arr, val, k;
    var temp = {};
    for (i = 0; i < data.length; i++) {
        arr = data[i][0].split(" ");
        month = arr[1];
        val = data[i][1];
        k = data[i][2];
        if (currentMonth !== month) {
            temp[month] = {};
        }
        temp[month][val] = temp[month][val] ? temp[month][val] + k : k;
        currentMonth = month;
    }

    //convert to array. This is more suitable
    //for things like chart.js
    var prop;
    var output = [];
    for (prop in temp) {
        output.push([prop, temp[prop]]);
    }
    return output;
};

TextAdapter.prototype.visitorAggregateByMonth = function () {
    var data = this.visitorAggregateByDay();
    return this.aggregateByMonth(data);
};

TextAdapter.prototype.loadData = function (fileName, days, callback) {
    days = days || 30;
    var filePath = path.join(this.dataDir, fileName);
    if (!fileExists(filePath)) {
        console.log(filePath + " does not exist");
        if (callback) {
            callback();
        }
        return;
    }
    var lineReader = new LineByLineReader(filePath);
    var self = this;
    lineReader.on('line', function (line) {
        self.addRow(line);
    });
    lineReader.on('error', function (e) {
        console.error(e);
    });
    lineReader.on('close', function () {
        console.log(fileName + " loaded");
        //last row should be april 1st
        var row = self.dataTable[self.dataTable.length - 1];
        //first row should be april 14st
        //var row = self.dataTable[0];

        var dt = new Date(row[self.columnNames.indexOf("date")]);
        var now = self.now || new Date();
        var daydiff = days_between(dt, now);
        if (daydiff < days) {
            var newMonth = dt.getMonth() - 1;
            var year = dt.getFullYear();
            if (newMonth < 0) {
                newMonth = 11;
                year = year - 1;
            }
            var newFile = year + "-" + newMonth + ".txt";
            self.loadData(newFile, days, callback);
        } else {
            if (callback) {
                callback();
            }

        }
    });
};

module.exports = TextAdapter;