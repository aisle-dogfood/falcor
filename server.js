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
            // Validate serverPort is a number to prevent command injection
            const portNum = parseInt(serverPort, 10);
            if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                console.error("Invalid port number");
                return;
            }
            
            const url = `http://localhost:${portNum}`;
            const { platform } = require('os');
            const { spawn } = require('child_process');
            
            // Use platform-specific commands to open URL
            switch (platform()) {
                case 'darwin': // macOS
                    spawn('open', [url]);
                    break;
                case 'win32': // Windows
                    spawn('cmd', ['/c', 'start', url]);
                    break;
                default: // Linux and others
                    spawn('xdg-open', [url]);
                    break;
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
