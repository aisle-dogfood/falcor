var isObject = require("./../support/isObject");
var transferBackReferences = require("./../support/transferBackReferences");
var removeNodeAndDescendants = require("./../support/removeNodeAndDescendants");

module.exports = function replaceNode(node, replacement, parent, key, lru, mergeContext) {
    if (node === replacement) {
        return node;
    } else if (isObject(node)) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru, mergeContext);
    }

    // Prevent prototype pollution by validating the property key and coercing
    // it to a proper property key (ToPropertyKey) before use.
    var prop = (typeof key === "symbol") ? key : String(key);
    if (prop !== "__proto__" && prop !== "constructor" && prop !== "prototype") {
        // Mark replacement as a model-created node to allow LRU operations
        // while preventing mutation of arbitrary objects.
        replacement.$_modelCreated = true;
        parent[prop] = replacement;
    }
    return replacement;
};
