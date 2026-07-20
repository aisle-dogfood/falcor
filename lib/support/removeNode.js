var $ref = require("./../types/ref");
var splice = require("./../lru/splice");
var isObject = require("./../support/isObject");
var hasOwn = require("./../support/hasOwn");
var unlinkBackReferences = require("./../support/unlinkBackReferences");
var unlinkForwardReference = require("./../support/unlinkForwardReference");

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
        // Prevent prototype pollution by rejecting dangerous keys on write
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            // Do not attempt to remove or mutate global prototypes.
            return false;
        }
        if (parent && hasOwn(parent, key)) {
            parent[key] = node.$_parent = void 0;
        } else {
            node.$_parent = void 0;
        }
        return true;
    }
    return false;
};
