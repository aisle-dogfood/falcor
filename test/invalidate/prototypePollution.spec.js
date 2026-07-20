var falcor = require('./../../lib');
var Model = falcor.Model;

describe('invalidate prototype pollution protections', function() {

    ["__proto__", "constructor", "prototype"].forEach(function(key) {
        it('should not modify Object.prototype when invalidating ' + key, function() {
            // Clean up any existing test artifact.
            if (Object.prototype.hasOwnProperty("$_parent")) {
                delete Object.prototype.$_parent;
            }

            var model = new Model({ cache: {} });

            // Attempt to invalidate a dangerous key.
            model.invalidate([key]);

            // Ensure no prototype pollution occurred.
            expect(Object.prototype.hasOwnProperty("$_parent")).toBe(false);
        });
    });
});
