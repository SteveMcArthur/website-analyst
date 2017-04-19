
# Website-Analyst
Website Analyst is a simple back-end visitor tracking/analytics system. The concept is to provide an analytics system in the early stages of a website's development before a more robust analytics system like Google Analytics is implemented. In particular I wanted a simple system independant of third parties and especially Google. This started as a port from the node module [web-analyst](https://www.npmjs.com/package/web-analyst), however, it has now diverged quite a lot.


## Usage
```javascript
    var webAnalyst = require('./lib/website-analyst');
    var dataDir = path.resolve(__dirname, 'data');
    webAnalyst.init({
        ignoreIPs: ['192.168.x.x'],
        ignoreRoutes: ['/stats', 'favicon'],
        ignoreExtensions: ['.css', '.js'],
        dataDir: dataDir,
        debugMode: false,
        testMode: false
    });

    app.use(cookieParser());
    app.use(webAnalyst.track());
    app.use(express.static(path.join(__dirname, 'public')));

    // Analytics will be available at: http://yoursite.com/stats
    // Note that you might want to provide some sort of authentication
    // in order for this page to be available only by you.
    //Make sure this is applied before the "/" route.
    app.get('/stats', webAnalyst.render());
    app.use('/', routes);
    app.use('/users', users);

    // Start the engine
    app.use(webAnalyst.track());
```

## Usage with authentication page

    To protect access to your page, the process is slightly different.
    You would need to load a session manager (In this example cookie-session is used).
    
```javascript
    var cookieSession = require('cookie-session');
    app.use(cookieSession({
        name: 'session',
        keys: ['key1', 'key2']
    }));

    // Initialize with options users (Array of authorized users)
    webAnalyst.init({
        // List of options
        // ...: ...
        // ---------------------
        users: [{
            username: 'johndoe',
            password: 'demopass'
        },
        {
            username: 'someoneelse',
            password: 'demo'
        }]
    });

    // Start the engine
    app.use(webAnalyst.track());

    // Set route
    app.all('/stats', webAnalyst.check(), webAnalyst.render());
```  

## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT license](http://creativecommons.org/licenses/MIT/)

Copyright &copy; 2017+ Steve McArthur <steve@stevemcarthur.co.uk> (http://www.stevemcarthur.co.uk)



