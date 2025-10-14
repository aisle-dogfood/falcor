/* eslint-disable camelcase */

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

module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    // Sanitize key to prevent prototype pollution
    if (!isSafeKey(key)) {
        throw new Error("Dangerous key detected in insertNode: " + String(key));
    }

    node.$_key = key;
    node.$_parent = parent;

    if (version !== undefined) {
        node.$_version = version;
    }
    if (!node.$_absolutePath) {
        if (Array.isArray(key)) {
            node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index);
            Array.prototype.push.apply(node.$_absolutePath, key);
        } else {
            node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index);
            node.$_absolutePath.push(key);
        }
    }

    // Prevent prototype pollution by checking for dangerous keys
    if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
        parent[key] = node;
    }

    return node;
};
