var setJSONGraphs = require("../../../lib/set/setJSONGraphs");
var getModel = require("../support/getModel");

describe("setJSONGraphs prototype pollution", function() {
    it("does not write back-references onto Object.prototype for malicious $ref with __proto__", function() {
        // Ensure clean starting state
        expect(Object.prototype.$_refsLength).toBe(undefined);
        expect(Object.prototype.$_ref0).toBe(undefined);

        var lru = new Object();
        var cache = {};
        var version = 0;

        // Attempt to merge a JSONGraph with a $ref that contains __proto__ as a segment.
        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [{
                jsonGraph: {
                    dangerous: { $type: "ref", value: ["__proto__", "polluted"] }
                },
                paths: [["dangerous"]]
            }]
        );

        // The prototype must not be polluted by internal back-reference fields.
        expect(Object.prototype.$_refsLength).toBe(undefined);
        expect(Object.prototype.$_ref0).toBe(undefined);
    });
});
