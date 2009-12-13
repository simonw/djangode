/*jslint laxbreak: true, eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports */
var sys = require('sys');

var AssertFailedException = function (msg) {
    this.message = msg;
};

var isEqual = function (expected, actual) {

    var key, i;

    if (typeof actual !== typeof expected) { return false; }

    if (actual instanceof RegExp) { return actual.source === expected.source; }
    if (actual instanceof Date) { return actual.getTime() === expected.getTime(); }

    if (actual instanceof Array) {
        if (actual.length !== expected.length) {
            return false;
        }

        for (i = 0; i < expected.length; i++) {
            if (!isEqual(expected[i], actual[i])) {
                return false;
            }
        }
        return true;
    }

    // Objects are compared in a sort of "at least equal to"-way, that is, the
    // actual object must have the expected properties with the expected
    // values, but it is still considered equal if it has some properties on it
    // that are not on the expected object.
    if (typeof expected === 'object') {
        for (key in expected) {
            if (expected.hasOwnProperty(key)) {
                if (!isEqual(actual[key], expected[key])) { return false; }
            }
        }
        return true;
    }

    return actual === expected;
};

var testcases = [];

exports.dsl = {

    testcase: function (name) {
        testcases.unshift({ name: name, tests: [] });
    },

    test: function (name, func) {
        testcases[0].tests.push({ name: name, body: func });
    },

    setup: function (func) {
        testcases[0].setup = func;
    },

    teardown: function (func) {
        testcases[0].teardown = func;
    },

    run: function () {

        var count = 0, failed = 0, errors = 0;

        testcases.reverse();

        testcases.forEach( function (testcase) {

            sys.puts('\n[Testcase: ' + testcase.name + ']');

            testcase.tests.forEach( function (test) {

                count++;
                
                var context = testcase.setup ? testcase.setup() : {};

                try {
                    test.body(context);
                    sys.puts(' [OK] ' + test.name + ': passed');
                } catch (e) {
                    if (e instanceof AssertFailedException) {
                        sys.puts(' [--] ' + test.name + ': failed. ' + e.message);
                        failed++;
                    } else {
                        sys.print(' [!!] ' + test.name + ': error. ');
                        if (e.stack && e.type) {
                            sys.puts(e.type + '\n' +  e.stack);
                        } else {
                            sys.puts(JSON.stringify(e, 0, 2));
                        }
                        errors++;
                    }
                }

                if (testcase.teardown) { testcase.teardown(context); }
            });
            sys.puts('----');

        });
        sys.puts('\nTotal: ' + count + ', Failures: ' + failed + ', Errors: ' + errors + '');
    },

    assertEquals: function (actual, expected) {
        if (!isEqual(actual, expected)) {
            throw new AssertFailedException(
                '\nExpected: ' + sys.inspect(actual) + '\nActual: ' + sys.inspect(expected) + '\n'
            ); 
        }
    },

    shouldThrow: function (func, args, this_context) {
        try {
            func.apply(this_context, args);
        } catch (e) {
            return;
        }
        throw new AssertFailedException('No exception was thrown');
    },

    shouldNotThrow: function (func, args, this_context) {
        try {
            func.apply(this_context, args);
        } catch (e) {
            throw new AssertFailedException('Caught <' + e + '>');
        }
    },
    
    fail: function (message) {
        throw new AssertFailedException(message);
    }
};

/*
function broken(s) {
    return tobis.hest;
}

with (exports.dsl) {
    testcase('Testing testsystem')
        test('two should equal two', function () {
            assertEquals(2, 2);
            shouldNotThrow( assertEquals, [2,2] );
        })
        test('four should not eqaul two', function () {
            shouldThrow( assertEquals, [2,4] );
        })
        test('broken function should throw', function () {
            shouldThrow( broken );
        })
        test('arrays should be equal', function () {
            assertEquals([1,2,3,4], [1,2,3,4]);
        })
        test('different arrays should not be equal', function () {
            shouldThrow( assertEquals, [ [1,2,3,4], [1,2,3] ]);
        })
        test('regexes should be equal', function () {
            assertEquals( /abc/, /abc/ );
        })
        test('different regexes should not be equal', function () {
            shouldThrow( assertEquals, [ /abc/, /edf/ ]);
        })
        test('dates should be equal', function () {
            assertEquals( new Date(376110000000) , new Date(376110000000) );
        })
        test('different dates should not be equal', function () {
            shouldThrow( assertEquals, [ new Date(376110000000), new Date() ]);
        })
        test('objects should be equal', function () {
            assertEquals( {a: 'hest', b: 5, c: [1,2,3]}, {a: 'hest', b: 5, c: [1,2,3]} );
        })
        test('different objects should not be equal', function () {
            shouldThrow( assertEquals, [ {a: 'hest', b: 5, c: [1,2,3]}, {a: 'hest', b: 5, c: [2,3]} ]);
        })
    run();
}
*/

