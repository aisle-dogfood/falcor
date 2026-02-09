const testRunner = require('./testRunner');
const falcor = require('./../lib/');
const Model = falcor.Model;

describe('Prototype Pollution Protection', function() {
    it('should prevent __proto__ pollution in JSONGraph get', function() {
        var model = new Model({
            cache: {
                test: {
                    value: 'safe'
                }
            }
        });

        // Attempt to pollute via __proto__
        model.getCache(['__proto__', 'polluted']);
        
        // Verify that Object.prototype was not polluted
        var testObj = {};
        expect(testObj.polluted).toBe(undefined);
    });

    it('should prevent constructor pollution in JSONGraph get', function() {
        var model = new Model({
            cache: {
                test: {
                    value: 'safe'
                }
            }
        });

        // Attempt to pollute via constructor
        model.getCache(['constructor', 'polluted']);
        
        // Verify that Object.constructor was not polluted
        var testObj = {};
        expect(testObj.constructor.polluted).toBe(undefined);
    });

    it('should prevent prototype pollution in JSONGraph get', function() {
        var model = new Model({
            cache: {
                test: {
                    value: 'safe'
                }
            }
        });

        // Attempt to pollute via prototype
        model.getCache(['prototype', 'polluted']);
        
        // Verify that prototype was not polluted
        var testObj = {};
        expect(testObj.prototype).toBe(undefined);
    });

    it('should still work with safe keys', function(done) {
        var model = new Model({
            cache: {
                test: {
                    $type: 'atom',
                    value: 'safe'
                }
            }
        });

        model.get(['test']).subscribe(function(result) {
            expect(result.json.test).toBe('safe');
            done();
        }, done);
    });

    it('should handle nested paths with dangerous keys gracefully', function() {
        var model = new Model({
            cache: {
                user: {
                    name: 'John'
                }
            }
        });

        // Attempt nested pollution
        model.getCache(['user', '__proto__', 'polluted']);
        
        var testObj = {};
        expect(testObj.polluted).toBe(undefined);
    });
});
