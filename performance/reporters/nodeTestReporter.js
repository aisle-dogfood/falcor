var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var dirPath = path.resolve(__dirname, '../out');

var DEFAULT_NAME = 'node-benchmark.csv';
var COMMAND_OPTION = '-n';

module.exports = {
    resultsReporter: function (results) {
        var filePath = path.resolve(dirPath, getFileName());
        mkdirp(path.dirname(filePath), function (err) {
            if (err) {
                console.error('\nError writing file: ' + filePath);
            } else {
                fs.writeFileSync(filePath, results);
                console.info('\nCreated output file: ' + filePath);
            }
        });
    },


    benchmarkReporter: function (benchmark) {
        console.info(benchmark);
    }
};

function getFileName() {
    if (typeof process !== 'undefined') {
        var name = DEFAULT_NAME;
        var foundName = false;
        process.argv.forEach(function(x) {
            if (x === COMMAND_OPTION) {
                foundName = true;
            }

            else if (foundName) {
                // Sanitize the filename to prevent path traversal
                // Only allow alphanumeric characters, hyphens, underscores, and .csv extension
                if (/^[\w\-]+\.csv$/.test(x)) {
                    name = x;
                } else {
                    console.warn('\nInvalid filename provided. Using default name: ' + DEFAULT_NAME);
                }
                foundName = false; // Reset flag after processing the name
            }
        });
        return name;
    }
    return DEFAULT_NAME;
}
