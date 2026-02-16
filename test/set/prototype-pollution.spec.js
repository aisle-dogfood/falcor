var falcor = require("./../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var toObservable = require('../toObs');

describe("Prototype Pollution Protection", function() {
    beforeEach(function() {
        // Clean up any prototype pollution before each test
        delete Object.prototype.polluted;
        delete Object.prototype.isAdmin;
    });

    afterEach(function() {
        // Clean up any prototype pollution after each test
        delete Object.prototype.polluted;
        delete Object.prototype.isAdmin;
    });

    it('should not pollute Object.prototype via __proto__ in JSONGraph paths', function(done) {
        var model = new Model();
        
        // Attempt to pollute via __proto__
        model._setJSONGs(model, [{
            jsonGraph: {
                __proto__: {
                    polluted: "yes"
                }
            },
            paths: [
                ['__proto__', 'polluted']
            ]
        }]);

        // Verify Object.prototype was not polluted
        expect({}.polluted).toBeUndefined();
        expect(Object.prototype.polluted).toBeUndefined();
        done();
    });

    it('should not pollute Object.prototype via constructor in JSONGraph paths', function(done) {
        var model = new Model();
        
        // Attempt to pollute via constructor
        model._setJSONGs(model, [{
            jsonGraph: {
                constructor: {
                    polluted: "yes"
                }
            },
            paths: [
                ['constructor', 'polluted']
            ]
        }]);

        // Verify Object.prototype was not polluted
        expect({}.polluted).toBeUndefined();
        expect(Object.prototype.polluted).toBeUndefined();
        done();
    });

    it('should not pollute Object.prototype via prototype in JSONGraph paths', function(done) {
        var model = new Model();
        
        // Attempt to pollute via prototype
        model._setJSONGs(model, [{
            jsonGraph: {
                prototype: {
                    polluted: "yes"
                }
            },
            paths: [
                ['prototype', 'polluted']
            ]
        }]);

        // Verify Object.prototype was not polluted
        expect({}.polluted).toBeUndefined();
        expect(Object.prototype.polluted).toBeUndefined();
        done();
    });

    it('should not pollute via __proto__ in pathValues', function(done) {
        var model = new Model();
        var onNext = jest.fn();
        
        toObservable(model.set({
            path: ['__proto__', 'isAdmin'],
            value: true
        })).
        doAction(onNext).
        doAction(noOp, noOp, function() {
            // Verify Object.prototype was not polluted
            expect({}.isAdmin).toBeUndefined();
            expect(Object.prototype.isAdmin).toBeUndefined();
        }).
        subscribe(noOp, done, done);
    });

    it('should not pollute via constructor in pathValues', function(done) {
        var model = new Model();
        var onNext = jest.fn();
        
        toObservable(model.set({
            path: ['constructor', 'isAdmin'],
            value: true
        })).
        doAction(onNext).
        doAction(noOp, noOp, function() {
            // Verify Object.prototype was not polluted
            expect({}.isAdmin).toBeUndefined();
            expect(Object.prototype.isAdmin).toBeUndefined();
        }).
        subscribe(noOp, done, done);
    });

    it('should not pollute via nested __proto__ paths', function(done) {
        var model = new Model();
        
        // Attempt to pollute via nested path
        model._setJSONGs(model, [{
            jsonGraph: {
                user: {
                    __proto__: {
                        polluted: "nested"
                    }
                }
            },
            paths: [
                ['user', '__proto__', 'polluted']
            ]
        }]);

        // Verify Object.prototype was not polluted
        expect({}.polluted).toBeUndefined();
        expect(Object.prototype.polluted).toBeUndefined();
        done();
    });

    it('should handle legitimate keys that look similar to dangerous keys', function(done) {
        var model = new Model();
        var onNext = jest.fn();
        
        // These should work fine as they are not exact matches
        toObservable(model.set({
            path: ['user', '__proto__x', 'name'],
            value: 'test'
        })).
        doAction(onNext).
        doAction(noOp, noOp, function() {
            expect(onNext).toHaveBeenCalledTimes(1);
            // Verify the legitimate key was set
            var cache = model._root.cache;
            expect(cache.user).toBeDefined();
            expect(cache.user['__proto__x']).toBeDefined();
            expect(cache.user['__proto__x'].name).toBeDefined();
        }).
        subscribe(noOp, done, done);
    });
});
