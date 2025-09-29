/* eslint-disable camelcase */

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

module.exports = function insertNode(node, parent, key, version, optimizedPath) {
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

    // Sanitize the key before using it as a property name to prevent prototype pollution
    var sanitizedKey = sanitizeKey(key);
    parent[sanitizedKey] = node;

    return node;
};
