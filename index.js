/*global require, __dirname, module, console*/
var fs = require('fs');
var jsonEngine = require('jsonfile');
jsonEngine.spaces = 4;
var pathEngine = require('path');
var StatsEngine = require(__dirname + '/statsEngine');

var qs = require('querystring');
var uuid = require('uuid');
var handlebars = require('handlebars');

var all = [];

var indexPath = pathEngine.join(__dirname, 'public');
var statsPage = 'stats.hbs';
var loginPage = 'login.hbs';

var reqOptions = {
    root: indexPath,
    dotfiles: 'allow',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
};

var statsEngine;
var users = [{
    username: 'admin',
    password: 'demopass'
}, {
    username: 'someoneelse',
    password: 'demo'
}];

/**
 * Setup the engine. Make files available through Express
 * @param params
 */
module.exports.init = function (params) {
    params = params || {};
    if (params.users) {
        users = params.users;
        params.users = undefined;
    }
    statsEngine = new StatsEngine(params);
};


module.exports.renderToString = function (source, data) {
    var template,
        outputString;

    template = handlebars.compile(source);
    outputString = template(data);

    return outputString;
};


module.exports.renderView = function (view, data, cb) {
    var self = this,
        content;

    // read the file and use the callback to render the view
    fs.readFile(__dirname + '/views/' + view, function (err, source) {
        if (!err) {
            source = source.toString();
            content = self.renderToString(source, data);
            cb(content);
        } else {
            //res.send('Internal error.');
            cb('Internal error');
        }
    });

};


/**
 * Check user credential.
 * @param post Form data coming from post request
 * @param cb Callback to be called when all checking are done
 */
module.exports.login = function (post, cb) {
    var user, message, i;
    var loginOk = false;
    if (users.length) {
        loginOk = false;
        for (i = 0; i < users.length; ++i) {
            user = users[i];
            console.log(user);

            if (post.username === user.username && post.password === user.password) {
                loginOk = true;
                message = 'Success';
                break;
            }
        }

        if (!loginOk) {
            message = 'Wrong credential';
        }
    } else {
        // No users defined, login is always okay
        loginOk = true;
        message = 'Success';
    }

    cb(loginOk, message);
};

module.exports.check = function () {
    var self = this;
    var noCheck;

    return function (req, res, next) {
        // If no users are defined, just skip this check
        noCheck = !users.length;
        if (noCheck) {
            next();
            return;
        }

        if (req.query.logout) {
            if (req.session) {
                req.session.web_analyst_user_id = null;
                self.renderView(loginPage, {
                        message: ''
                    },
                    function (content) {
                        res.send(content);
                    });
            }
            return;
        }

        // http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
        if (req.method === 'POST') {
            var body = '';

            req.on('data', function (data) {
                body += data;

                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6) {
                    req.connection.destroy();
                }
            });

            req.on('end', function () {
                var post;
                post = qs.parse(body);
                self.login(post, function (loggedIn, message) {
                    if (!loggedIn) {
                        self.renderView(loginPage, {
                            message: message
                        }, function (content) {
                            res.send(content);
                        });
                        return;
                    }

                    req.session.web_analyst_user_id = uuid.v4();
                    // Fix this redirection
                    // res.redirect('');

                    // Show stats page
                    self.renderView(statsPage, {}, function (content) {
                        res.send(content);
                    });

                });
            });

            return;
        }

        if (!req.session || !req.session.web_analyst_user_id) {
            self.renderView(loginPage, {
                    message: ''
                },
                function (content) {
                    res.send(content);
                });

            return;
        }

        next();

    };
};



/**
 * Display the page containing the stats
 * @returns {Function}
 */
module.exports.render = function () {
    var self = this;
    var jsonfile;

    return function (req, res) {
        // Client is asking for data
        if (req.query.data === 'z1') {
            jsonfile = statsEngine.getDatafile();
            jsonEngine.readFile(jsonfile, function (err, data) {
                if (err) {
                    console.error(err);
                    res.send('Something went wrong');
                    return;
                }

                res.json(data);
            });
            return;
        }

        // Client is asking for data
        if (req.query.data === 'z2') {
            jsonfile = statsEngine.getOtherDatafile();
            jsonEngine.readFile(jsonfile, function (err, data) {
                if (err) {
                    console.error(err);
                    res.send('Something went wrong');
                    return;
                }

                data.referers = data.referers || {};
                res.json(data.referers);
            });
            return;
        }

        // Client is asking for data
        if (req.query.data === 'z3') {
            jsonfile = statsEngine.getOtherDatafile();
            jsonEngine.readFile(jsonfile, function (err, data) {
                if (err) {
                    console.error(err);
                    res.send('Something went wrong');
                    return;
                }

                data.keywords = data.keywords || {};
                res.json(data.keywords);
            });
            return;
        }

        // Show stats page
        self.renderView(statsPage, {}, function (content) {
            res.send(content);
        });

    };
};


/**
 * Harvest data
 * @returns {Function}
 */
module.exports.track = function () {
    var self = this;
    var firstRequest;
    firstRequest = true;
    return function (req, res, next) {
        var stats,
            ip;

        if (firstRequest) {
            firstRequest = false;
        }

        ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        stats = {
            headers: req.headers,
            host: req.headers.host,
            referer: req.headers.referer,
            useragent: req.headers['user-agent'],
            acceptlanguage: req.headers['accept-language'],
            cookie: req.headers.cookie,
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
            route: req.route,
            secure: req.secure,
            signedCookie: req.signedCookie,
            subDomains: req.subdomains,
            xhr: req.xhr
        };

        statsEngine.parse(stats);
        all.push(stats);

        next();
    };
};