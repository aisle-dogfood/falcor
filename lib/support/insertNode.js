/* eslint-disable camelcase */
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

    // Prevent prototype pollution by validating the property key and coercing
    // it to a proper property key (ToPropertyKey) before use.
    var prop = (typeof key === "symbol") ? key : String(key);
    if (prop !== "__proto__" && prop !== "constructor" && prop !== "prototype") {
        // Mark node as model-created before attaching to parent so promote
        // can safely identify model-owned cache nodes.
        node.$_modelCreated = true;
        parent[prop] = node;
    }

    return node;
};
