var falcor = require("./../../lib/");
var Model = falcor.Model;

describe('get - prototype pollution', function() {

    it('does not pollute Object.prototype when traversing dangerous keys', function(done) {
        // Ensure test precondition
        expect(Object.prototype.hasOwnProperty('$_prev')).toBe(false);
        expect(Object.prototype.hasOwnProperty('$_next')).toBe(false);

        var model = new Model({ cache: { a: { b: { c: 1 } } } });

        // Attempt to traverse __proto__ via get
        model.get(['__proto__']).subscribe(function() {}, function(err) {
            done.fail(err);
        }, function() {
            // After the operation, Object.prototype should not have been mutated
            expect(Object.prototype.hasOwnProperty('$_prev')).toBe(false);
            expect(Object.prototype.hasOwnProperty('$_next')).toBe(false);
            done();
        });
    });
});
