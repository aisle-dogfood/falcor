var promote = require("./../lru/promote");
var clone = require("./util/clone");
var $ref = require("./../types/ref");
var $atom = require("./../types/atom");
var $error = require("./../types/error");

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

            // Prevent prototype pollution by checking for dangerous keys
            if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
                if (!curr[key]) {
                    hasValues = true;
                    curr[key] = {};
                }
                curr = curr[key];
            } else {
                // For dangerous keys, create a safe object to continue traversal
                if (!curr[key]) {
                    hasValues = true;
                    curr[key] = {};
                }
                curr = curr[key];
            }
        }

        // assign the last
        key = optimizedPath[i];

        // TODO: Special case? do string comparisons make big difference?
        // Prevent prototype pollution by checking for dangerous keys
        if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
            curr[key] = materialized ? {$type: $atom} : valueNode;
        }
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

            // The branch info is already generated output from the walk algo
            // with the required __path information on it.
            // Prevent prototype pollution by checking for dangerous keys
            if (k !== "__proto__" && k !== "constructor" && k !== "prototype") {
                if (!curr[k]) {
                    hasValues = true;
                    curr[k] = branchInfo[i];
                }
            } else {
                // For dangerous keys, don't assign branchInfo but still allow traversal
                if (!curr[k]) {
                    hasValues = true;
                    curr[k] = {};
                }
            }

            prev = curr;
            prevK = k;
            curr = curr[k];
        }
        k = requestedPath[i];
        if (valueNode !== undefined) {
          if (k != null) {
              // Prevent prototype pollution by checking for dangerous keys
              if (k !== "__proto__" && k !== "constructor" && k !== "prototype") {
                  hasValues = true;
                  if (!curr[k]) {
                    curr[k] = valueNode;
                  }
              }
          } else {
              // We are protected from reaching here when depth is 1 and prev is
              // undefined by the InvalidModelError and NullInPathError checks.
              // Prevent prototype pollution by checking for dangerous keys
              if (prevK !== "__proto__" && prevK !== "constructor" && prevK !== "prototype") {
                  prev[prevK] = valueNode;
              }
          }
        }
    }
    if (outerResults) {
        outerResults.hasValues = hasValues;
    }
};
