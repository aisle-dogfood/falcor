var privatePrefix = require("./../internal/privatePrefix");
var hasOwn = require("./../support/hasOwn");
var isArray = Array.isArray;
var isObject = require("./../support/isObject");

// Helper function to check if a key is safe from prototype pollution
function isSafeKey(key) {
    return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}

module.exports = function clone(value) {
    var dest = value;
    if (isObject(dest)) {
        dest = isArray(value) ? [] : {};
        var src = value;
        for (var key in src) {
            if (key.lastIndexOf(privatePrefix, 0) === 0 || !hasOwn(src, key)) {
                continue;
            }
            // Prevent prototype pollution
            if (!isSafeKey(key)) {
                continue;
            }
            dest[key] = src[key];
        }
    }
    return dest;
};
