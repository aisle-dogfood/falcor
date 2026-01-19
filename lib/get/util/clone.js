// Copies the node
var privatePrefix = require("./../../internal/privatePrefix");

var hasOwn = Object.prototype.hasOwnProperty;

// Helper function to check if a key is safe to use as a property name
function isSafeKey(key) {
    return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}

module.exports = function clone(node) {
    if (node === undefined) {
        return node;
    }

    var outValue = {};
    for (var k in node) {
        if (k.lastIndexOf(privatePrefix, 0) === 0 || !hasOwn.call(node, k) || !isSafeKey(k)) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};
