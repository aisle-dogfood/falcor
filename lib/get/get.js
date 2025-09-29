var getCachePosition = require("./../get/getCachePosition");
var InvalidModelError = require("./../errors/InvalidModelError");
var BoundJSONGraphModelError = require("./../errors/BoundJSONGraphModelError");

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

function mergeInto(target, obj) {
    /* eslint guard-for-in: 0 */
    if (target === obj) {
        return;
    }
    if (target === null || typeof target !== "object" || target.$type) {
        return;
    }
    if (obj === null || typeof obj !== "object" || obj.$type) {
        return;
    }

    for (var key in obj) {
        // When merging over a temporary branch structure (for example, as produced by an error selector)
        // with references, we don't want to mutate the path, particularly because it's also $_absolutePath
        // on cache nodes
        if (key === "$__path") {
            continue;
        }

        var sanitizedKey = sanitizeKey(key);
        var targetValue = target[sanitizedKey];
        if (targetValue === undefined) {
            target[sanitizedKey] = obj[key];
        } else {
            mergeInto(targetValue, obj[key]);
        }
    }
}

function defaultEnvelope(isJSONG) {
    return isJSONG ? {jsonGraph: {}, paths: []} : {json: {}};
}

module.exports = function get(walk, isJSONG) {
    return function innerGet(model, paths, seed) {
        // Result valueNode not immutable for isJSONG.
        var nextSeed = isJSONG ? seed : [{}];
        var valueNode = nextSeed[0];
        var results = {
            values: nextSeed,
            optimizedPaths: []
        };
        var cache = model._root.cache;
        var boundPath = model._path;
        var currentCachePosition = cache;
        var optimizedPath, optimizedLength;
        var i, len;
        var requestedPath = [];
        var derefInfo = [];
        var referenceContainer;

        // If the model is bound, then get that cache position.
        if (boundPath.length) {

            // JSONGraph output cannot ever be bound or else it will
            // throw an error.
            if (isJSONG) {
                return {
                    criticalError: new BoundJSONGraphModelError()
                };
            }

            // using _getOptimizedPath because that's a point of extension
            // for polyfilling legacy falcor
            optimizedPath = model._getOptimizedBoundPath();
            optimizedLength = optimizedPath.length;

            // We need to get the new cache position path.
            currentCachePosition = getCachePosition(model, optimizedPath);

            // If there was a short, then we 'throw an error' to the outside
            // calling function which will onError the observer.
            if (currentCachePosition && currentCachePosition.$type) {
                return {
                    criticalError: new InvalidModelError(boundPath, optimizedPath)
                };
            }

            referenceContainer = model._referenceContainer;
        }

        // Update the optimized path if we
        else {
            optimizedPath = [];
            optimizedLength = 0;
        }

        for (i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, currentCachePosition, paths[i], 0,
                 valueNode, results, derefInfo, requestedPath, optimizedPath,
                 optimizedLength, isJSONG, false, referenceContainer);
        }

        // Merge in existing results.
        // Default to empty envelope if no results were emitted
        mergeInto(valueNode, paths.length ? seed[0] : defaultEnvelope(isJSONG));

        return results;
    };
};
