var $ref = require("./../types/ref");
var splice = require("./../lru/splice");
var isObject = require("./../support/isObject");
var unlinkBackReferences = require("./../support/unlinkBackReferences");
var unlinkForwardReference = require("./../support/unlinkForwardReference");

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

module.exports = function removeNode(node, parent, key, lru) {
    if (isObject(node)) {
        var type = node.$type;
        if (type) {
            if (type === $ref) {
                unlinkForwardReference(node);
            }
            splice(lru, node);
        }
        // Sanitize key to prevent prototype pollution
        if (!isSafeKey(key)) {
            throw new Error("Dangerous key detected in removeNode: " + String(key));
        }
        
        // eslint-disable-next-line camelcase
        parent[key] = node.$_parent = void 0;
        // eslint-disable-next-line camelcase
        // Prevent prototype pollution by checking for dangerous keys
        if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
            parent[key] = node.$_parent = void 0;
        } else {
            node.$_parent = void 0;
        }
        return true;
    }
    return false;
};
