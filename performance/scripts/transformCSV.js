var fs = require('fs');
var parse = require('csv-parse');
var minimist = require('minimist');
var path = require('path');
var argv = minimist(process.argv.slice(2));

if (argv._.length < 2) {
    console.log('node transformCSV.js <inputFile.csv> <outputFile.csv>');
    process.exit(9);
}

// Validate and sanitize file paths to prevent path traversal
var inputPath = path.resolve(process.cwd(), path.normalize(argv._[0]));
var outputPath = path.resolve(process.cwd(), path.normalize(argv._[1]));

// Ensure paths are within the current working directory to prevent path traversal
var cwd = process.cwd();
if (!inputPath.startsWith(cwd) || !outputPath.startsWith(cwd)) {
    console.error('Error: File paths must be within the current working directory');
    process.exit(1);
}

var input = fs.createReadStream(inputPath);
var output = fs.createWriteStream(outputPath);

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var parser = parse({trim:true}, function(err, data) {

    var headers = 0;
    var rows = 0;

    var transformed = data.reduce(function(prev, current) {

        var header = prev[0];
        var avg = prev[1];

        var firstCell = current[0];

        if (!isNumber(firstCell)) {
            if (header) {
                prev[0] = header.map(function(headerValue, idx) {
                    return headerValue + ":" + current[idx];
                });
            } else {
                prev[0] = current.concat();
            }

            headers = headers + 1;

        } else {

            if (avg) {
                prev[1] = avg.map(function(value, idx) {
                    // Running Average
                    return ((value * rows) + parseFloat(current[idx]))/(rows + 1);
                });
            } else {
                prev[1] = current.map(function(v) { return parseFloat(v); });
            }

            rows = rows + 1;
        }

        return prev;

    }, []);

    output.write(transformed.reduce(function(prev, current) {
        return prev + '\n' + current.join(',');
    }, ''));
});

input.pipe(parser);