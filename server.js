var express = require("express");
var app = express();
var basicAuth = require('express-basic-auth');

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
    // SECURITY: Add basic authentication to protect sensitive coverage reports
    // This prevents unauthorized access to code coverage data which could expose
    // internal implementation details and potential attack vectors
    app.use(basicAuth({
        users: { 'admin': process.env.COVERAGE_PASSWORD || 'changeme' },
        challenge: true,
        realm: 'Coverage Reports - Restricted Access'
    }));
    app.use(express.static("coverage/lcov-report"));
    return listen(serverPort, launchWindow);
}

// Run if main
if (require.main === module) {
    var port = process.argv[2] || 8080;
    var run = process.argv[3];
    switch (run) {
        case "examples":
            // SECURITY: Add basic authentication to protect example routes
            // This prevents unauthorized access to example code and configurations
            // which could potentially reveal sensitive implementation details
            app.use(basicAuth({
                users: { 'admin': process.env.EXAMPLES_PASSWORD || 'changeme' },
                challenge: true,
                realm: 'Examples - Restricted Access'
            }));
            app.use(express.static("."));
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
