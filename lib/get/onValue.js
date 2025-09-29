var promote = require("./../lru/promote");
var clone = require("./util/clone");
var $ref = require("./../types/ref");
var $atom = require("./../types/atom");
var $error = require("./../types/error");

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

module.exports = function onValue(model, node, seed, depth, outerResults,
                                  branchInfo, requestedPath, optimizedPath,
                                  optimizedLength, isJSONG) {
    // Promote first.  Even if no output is produced we should still promote.
    if (node) {
        promote(model._root, node);
    }

    // Preload
    if (!seed) {
        return;
    }

    var i, len, k, key, curr, prev = null, prevK;
    var materialized = false, valueNode, nodeType = node && node.$type, nodeValue = node && node.value;

    if (nodeValue === undefined) {
        materialized = model._materialized;
    }

    // materialized
    if (materialized) {
        valueNode = {$type: $atom};
    }

    // Boxed Mode will clone the node.
    else if (model._boxed) {
        valueNode = clone(node);
    }

    // We don't want to emit references in json output
    else if (!isJSONG && nodeType === $ref) {
        valueNode = undefined;
    }

    // JSONG always clones the node.
    else if (nodeType === $ref || nodeType === $error) {
        if (isJSONG) {
            valueNode = clone(node);
        } else {
            valueNode = nodeValue;
        }
    }

    else if (isJSONG) {
        var isObject = nodeValue && typeof nodeValue === "object";
        var isUserCreatedNode = !node || !node.$_modelCreated;
        if (isObject || isUserCreatedNode) {
            valueNode = clone(node);
        } else {
            valueNode = nodeValue;
        }
    }

    else if (node && nodeType === undefined && nodeValue === undefined) {
        // Include an empty value for branch nodes
        valueNode = {};
    } else {
        valueNode = nodeValue;
    }

    var hasValues = false;

    if (isJSONG) {
        curr = seed.jsonGraph;
        if (!curr) {
            hasValues = true;
            curr = seed.jsonGraph = {};
            seed.paths = [];
        }
        for (i = 0, len = optimizedLength - 1; i < len; i++) {
            key = optimizedPath[i];
            var sanitizedKey = sanitizeKey(key);

            if (!curr[sanitizedKey]) {
                hasValues = true;
                curr[sanitizedKey] = {};
            }
            curr = curr[sanitizedKey];
        }

        // assign the last
        key = optimizedPath[i];
        var sanitizedLastKey = sanitizeKey(key);

        // TODO: Special case? do string comparisons make big difference?
        curr[sanitizedLastKey] = materialized ? {$type: $atom} : valueNode;
        if (requestedPath) {
            seed.paths.push(requestedPath.slice(0, depth));
        }
    }

    // The output is pathMap and the depth is 0.  It is just a
    // value report it as the found JSON
    else if (depth === 0) {
        hasValues = true;
        seed.json = valueNode;
    }

    // The output is pathMap but we need to build the pathMap before
    // reporting the value.
    else {
        curr = seed.json;
        if (!curr) {
            hasValues = true;
            curr = seed.json = {};
        }
        for (i = 0; i < depth - 1; i++) {
            k = requestedPath[i];
            var sanitizedK = sanitizeKey(k);

            // The branch info is already generated output from the walk algo
            // with the required __path information on it.
            if (!curr[sanitizedK]) {
                hasValues = true;
                curr[sanitizedK] = branchInfo[i];
            }

            prev = curr;
            prevK = sanitizedK;
            curr = curr[sanitizedK];
        }
        k = requestedPath[i];
        var sanitizedFinalK = sanitizeKey(k);
        if (valueNode !== undefined) {
          if (k != null) {
              hasValues = true;
              if (!curr[sanitizedFinalK]) {
                curr[sanitizedFinalK] = valueNode;
              }
          } else {
              // We are protected from reaching here when depth is 1 and prev is
              // undefined by the InvalidModelError and NullInPathError checks.
              prev[prevK] = valueNode;
          }
        }
    }
    if (outerResults) {
        outerResults.hasValues = hasValues;
    }
};
