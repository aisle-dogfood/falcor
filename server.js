var express = require("express");
var basicAuth = require("express-basic-auth"); // Added for securing endpoints against information exposure
var app = express();

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
    // Require authentication for coverage reports to prevent information exposure
    if (!process.env.COVERAGE_PASSWORD) {
        console.warn("WARNING: No COVERAGE_PASSWORD environment variable set. Using a secure random password.");
    }
    
    app.use(basicAuth({
        users: { 'admin': process.env.COVERAGE_PASSWORD || require('crypto').randomBytes(16).toString('hex') },
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
            // Require authentication for examples to prevent information exposure
            if (!process.env.EXAMPLES_PASSWORD) {
                console.warn("WARNING: No EXAMPLES_PASSWORD environment variable set. Using a secure random password.");
            }
            
            app.use(basicAuth({
                users: { 'admin': process.env.EXAMPLES_PASSWORD || require('crypto').randomBytes(16).toString('hex') },
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
