/**
 * getCachePosition makes a fast walk to the bound value since all bound
 * paths are the most possible optimized path.
 *
 * @param {Model} model -
 * @param {Array} path -
 * @returns {Mixed} - undefined if there is nothing in this position.
 * @private
 */
module.exports = function getCachePosition(model, path) {
    var currentCachePosition = model._root.cache;
    var depth = -1;
    var maxDepth = path.length;

    // The loop is simple now, we follow the current cache position until
    //
    while (++depth < maxDepth &&
           currentCachePosition && !currentCachePosition.$type) {

        var key = path[depth];
        // Prevent prototype pollution by blocking access to dangerous properties
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return undefined;
        }
        currentCachePosition = currentCachePosition[key];
    }

    return currentCachePosition;
};
