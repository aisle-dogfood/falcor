var isInternalKey = require("./../support/isInternalKey");

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

/**
 * decends and copies the cache.
 */
module.exports = function getCache(cache) {
    var out = {};
    _copyCache(cache, out);

    return out;
};

function cloneBoxedValue(boxedValue) {
    var clonedValue = {};

    var keys = Object.keys(boxedValue);
    var key;
    var i;
    var l;

    for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];

        if (!isInternalKey(key)) {
            var sanitizedKey = sanitizeKey(key);
            clonedValue[sanitizedKey] = boxedValue[key];
        }
    }

    return clonedValue;
}

function _copyCache(node, out, fromKey) {
    // copy and return

    Object.
        keys(node).
        filter(function(k) {
            // Its not an internal key and the node has a value.  In the cache
            // there are 3 possibilities for values.
            // 1: A branch node.
            // 2: A $type-value node.
            // 3: undefined
            // We will strip out 3
            return !isInternalKey(k) && node[k] !== undefined;
        }).
        forEach(function(key) {
            var sanitizedKey = sanitizeKey(key);
            var cacheNext = node[key];
            var outNext = out[sanitizedKey];

            if (!outNext) {
                outNext = out[sanitizedKey] = {};
            }

            // Paste the node into the out cache.
            if (cacheNext.$type) {
                var isObject = cacheNext.value && typeof cacheNext.value === "object";
                var isUserCreatedcacheNext = !cacheNext.$_modelCreated;
                var value;
                if (isObject || isUserCreatedcacheNext) {
                    value = cloneBoxedValue(cacheNext);
                } else {
                    value = cacheNext.value;
                }

                out[sanitizedKey] = value;
                return;
            }

            _copyCache(cacheNext, outNext, key);
        });
}
