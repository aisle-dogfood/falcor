var $ref = require("./../types/ref");
var splice = require("./../lru/splice");
var isObject = require("./../support/isObject");
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
        // eslint-disable-next-line camelcase
        // Prevent prototype pollution by checking for dangerous keys
        if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
            parent[key] = node.$_parent = void 0;
        } else {
            node.$_parent = void 0;
        }
        return true;
    }
    return false;
};
