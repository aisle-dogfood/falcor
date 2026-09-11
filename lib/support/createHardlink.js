var __ref = require("./../internal/ref");
var isObject = require("./isObject");

module.exports = function createHardlink(from, to) {

    // Do not create back-references on unsafe targets (e.g., Object.prototype).
    // This prevents prototype pollution when references resolve to dangerous objects.
    if (!isObject(to) || to === Object.prototype) {
        return;
    }

    // create a back reference
    // eslint-disable-next-line camelcase
    var backRefs = to.$_refsLength || 0;
    to[__ref + backRefs] = from;
    // eslint-disable-next-line camelcase
    to.$_refsLength = backRefs + 1;

    // create a hard reference
    // eslint-disable-next-line camelcase
    from.$_refIndex = backRefs;
    // eslint-disable-next-line camelcase
    from.$_context = to;
};
