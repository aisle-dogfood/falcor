var isObject = require("./../support/isObject");
var transferBackReferences = require("./../support/transferBackReferences");
var removeNodeAndDescendants = require("./../support/removeNodeAndDescendants");

/**
 * Checks if a key is safe to use for object property assignment.
 * Dangerous keys like "__proto__", "constructor", and "prototype" can cause prototype pollution.
 * @param {*} key - The key to check
 * @returns {boolean} - True if the key is safe, false if it's dangerous
 */
function isSafeKey(key) {
    // Convert to string for comparison
    var keyStr = String(key);
    
    // Check for dangerous prototype pollution keys
    if (keyStr === "__proto__" || keyStr === "constructor" || keyStr === "prototype") {
        return false;
    }
    
    // Check for symbol keys which could also be dangerous
    if (typeof key === "symbol") {
        return false;
    }
    
    return true;
}

module.exports = function replaceNode(node, replacement, parent, key, lru, mergeContext) {
    // Sanitize key to prevent prototype pollution
    if (!isSafeKey(key)) {
        throw new Error("Dangerous key detected in replaceNode: " + String(key));
    }

    if (node === replacement) {
        return node;
    } else if (isObject(node)) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru, mergeContext);
    }

    // Prevent prototype pollution by checking for dangerous keys
    if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
        parent[key] = replacement;
    }
    return replacement;
};
