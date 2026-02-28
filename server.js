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
    // Add basic authentication to protect coverage reports
    app.use(basicAuth({
        users: { 'admin': process.env.COVERAGE_PASSWORD || 'changeme' },
        challenge: true,
        realm: 'Coverage Reports'
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
            // Add basic authentication to protect examples
            app.use(basicAuth({
                users: { 'admin': process.env.EXAMPLES_PASSWORD || 'changeme' },
                challenge: true,
                realm: 'Examples'
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
