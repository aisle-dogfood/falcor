var express = require("express");
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
            // SECURITY: Use spawn instead of exec to prevent command injection
            // Sanitize port number to ensure it's a valid integer within port range
            var sanitizedPort = Number(serverPort);
            if (!isNaN(sanitizedPort) && sanitizedPort > 0 && sanitizedPort < 65536) {
                // Use spawn with array arguments to safely handle the command and its parameters
                require("child_process").spawn("open", ["http://localhost:" + sanitizedPort]);
            } else {
                console.error("Invalid port number provided:", serverPort);
            }
        }
    });
}

function coverage(serverPort, launchWindow) {
    app.use(express.static("coverage/lcov-report"));
    return listen(serverPort, launchWindow);
}

// Run if main
if (require.main === module) {
    var port = process.argv[2] || 8080;
    var run = process.argv[3];
    switch (run) {
        case "examples":
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
