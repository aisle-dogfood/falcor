var $pathValue = require('falcor-json-graph').pathValue;
var getModel = require('../support/getModel');
var setPathValues = require('../../../lib/set/setPathValues');

describe('setPathValues prototype pollution', function() {
    it('does not allow prototype pollution via __proto__ path traversal', function() {
        // ensure clean state
        delete Object.prototype.polluted;
        expect(Object.prototype.polluted).toBe(undefined);

        var cache = {};
        var model = getModel({ cache: cache, version: 0 });

        var pathValues = [ $pathValue(['__proto__', 'polluted'], 'pwned') ];

        try {
            setPathValues(model, pathValues);
        } catch (e) {
            // Some implementations may reject dangerous keys; that's acceptable.
        }

        // Object.prototype must not be polluted by the set operation.
        expect(Object.prototype.polluted).toBe(undefined);

        // cleanup
        delete Object.prototype.polluted;
    });
});
