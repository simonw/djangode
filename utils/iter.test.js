process.mixin(GLOBAL, require('utils/test').dsl);
process.mixin(GLOBAL, require('utils/iter'));

var events = require('events');
var sys = require('sys');

testcase('reduce');
    test_async('should work like regular reduce', function (content, callback) {
        var list = [];
        for (var i = 0; i < 400000; i++) {
            list.push(i);
        }

        //var t = new Date();
        var expected = list.reduce(function (p, c) { return p + c; }, 0);
        //sys.debug(new Date() - t);

        reduce(list, function (p, c, callback) { callback(false, p + c); }, 0,
            function (error, actual) {
                //sys.debug(new Date() - t);
                assertEquals(expected, actual, callback);
                callback();
            }
        );
    });

run();

