var express = require("express");
var cookieParser = require("cookie-parser");
var csrf = require("csurf");
var app = express();

// Setup CSRF protection
app.use(cookieParser());
var csrfProtection = csrf({ cookie: true });

// Exports
module.exports = {
    coverage: coverage
};

function listen(serverPort, launchWindow, cb) {
    return app.listen(serverPort, function() {
        if (cb) {
            cb();
        }
        if (launchWindow) {
            require("child_process").exec("open http://localhost:" + serverPort);
        }
    });
}

function coverage(serverPort, launchWindow) {
    app.use(express.static("coverage/lcov-report"));
    // Apply CSRF protection
    app.use(csrfProtection);
    
    // Add a route to provide CSRF token to the client
    app.get("/csrf-token", function(req, res) {
        res.json({ csrfToken: req.csrfToken() });
    });
    
    return listen(serverPort, launchWindow);
}

// Run if main
if (require.main === module) {
    var port = process.argv[2] || 8080;
    var run = process.argv[3];
    switch (run) {
        case "examples":
            app.use(express.static("."));
            // Apply CSRF protection
            app.use(csrfProtection);
            
            // Add a route to provide CSRF token to the client
            app.get("/csrf-token", function(req, res) {
                res.json({ csrfToken: req.csrfToken() });
            });
            
            app.get("/500", function(req, res) {
                res.send(500);
            });
            listen(port, true);
            break;
        case "coverage":
        default:
            coverage(port, true);
            break;
    }
}
