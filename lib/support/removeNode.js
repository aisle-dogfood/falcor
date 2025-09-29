var $ref = require("./../types/ref");
var splice = require("./../lru/splice");
var isObject = require("./../support/isObject");
var unlinkBackReferences = require("./../support/unlinkBackReferences");
var unlinkForwardReference = require("./../support/unlinkForwardReference");

/**
 * Sanitizes a key to prevent prototype pollution attacks.
 * Dangerous keys like "__proto__", "prototype", and "constructor" are escaped.
 * @param {*} key - The key to sanitize
 * @returns {*} - The sanitized key
 */
function sanitizeKey(key) {
    // Only sanitize string keys that could cause prototype pollution
    if (typeof key === 'string') {
        if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
            // Escape dangerous keys by prefixing with underscore
            return '_' + key;
        }
    }
    return key;
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
        unlinkBackReferences(node);
        // Sanitize the key before using it as a property name to prevent prototype pollution
        var sanitizedKey = sanitizeKey(key);
        // eslint-disable-next-line camelcase
        parent[sanitizedKey] = node.$_parent = void 0;
        return true;
    }
    return false;
};
