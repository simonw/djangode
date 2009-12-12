var sys = require('sys');
process.mixin(GLOBAL, require('../utils/test').dsl);
process.mixin(GLOBAL, require('./template_defaults'));

testcase('Test dictsort filter');
    test('should sort correctly', function () {
        var list = [
            {'name': 'zed', 'age': 19},
            {'name': 'amy', 'age': 22},
            {'name': 'joe', 'age': 31}
        ];
        var before = list.slice(0);
        assertEquals([ list[1], list[2], list[0] ], filters.dictsort(list, 'name') );
        assertEquals(before, list);
    });

    test('should sort correctly with dictsortreversed', function () {
        var list = [
            {'name': 'zed', 'age': 19},
            {'name': 'amy', 'age': 22},
            {'name': 'joe', 'age': 31}
        ];
        var before = list.slice(0);
        assertEquals([ list[0], list[2], list[1] ], filters.dictsortreversed(list, 'name') );
        assertEquals(before, list);
    });

testcase('filesizeformat filter');
    test('should return correct readable filesizes', function () {
        assertEquals('117.7MB', filters.filesizeformat(123456789));
    });

testcase('first filter');
    test('should return first in list', function () {
        assertEquals('', filters.first('hest'));
        assertEquals('hest', filters.first(['hest', 'abe', 39]));
    });

testcase('fix_ampersands');
    test('should fix ampersands', function () {
        assertEquals('Tom &amp; Jerry', filters.fix_ampersands('Tom & Jerry'));
    });

testcase('floatformat filter');
    test('should format floats', function () {
        assertEquals('', filters.floatformat('hest'));

        assertEquals('34.2', filters.floatformat(34.23234));
        assertEquals('34',   filters.floatformat(34.00000));
        assertEquals('34.3', filters.floatformat(34.26000));

        assertEquals('34.232', filters.floatformat(34.23234, 3));
        assertEquals('34.000', filters.floatformat(34.00000, 3));
        assertEquals('34.260', filters.floatformat(34.26000, 3));

        assertEquals('34.232', filters.floatformat(34.23234, -3));
        assertEquals('34',     filters.floatformat(34.00000, -3));
        assertEquals('34.260', filters.floatformat(34.26000, -3));
    });
testcase('force_escape filter');
    test('should escape string', function () {
        assertEquals(
            '&lt;script=&qout;alert(&#39;din mor&#39;)&qout;&gt;&lt;/script&gt;',
            filters.force_escape('<script="alert(\'din mor\')"></script>')
        );
    });

testcase('get_digit');
    test('should get correct digit', function () {
        assertEquals(2,           filters.get_digit(987654321, 2));
        assertEquals('987654321', filters.get_digit('987654321', 2));
        assertEquals('hest',      filters.get_digit('hest'), 2);
        assertEquals(123,         filters.get_digit(123), 5);
        assertEquals(123,         filters.get_digit(123), 0);
    });

testcase('join filter')
    test('should join list', function () {
        assertEquals('1, 2, 3, 4', filters.join([1,2,3,4], ', '));
        assertEquals('', filters.join('1,2,3,4', ', '));
    });
testcase('last filter')
    test('should return last', function () {
        assertEquals('d', filters.last(['a', 'b', 'c', 'd']));
        assertEquals('', filters.last([]));
        assertEquals('', filters.last('hest'));
    });
testcase('length filter')
    test('should return correct length', function () {
        assertEquals(5, filters.length([1,2,3,4,5]));
        assertEquals(4, filters.length('hest'));
        assertEquals(0, filters.length(16));
    });
testcase('length_is filter')
    test('should return true on correct length', function () {
        assertEquals(true, filters.length_is([1,2,3,4,5], 5));
        assertEquals(true, filters.length_is('hest', 4));
    });
    test('should fail on incorrect length or bad arguments', function () {
        assertEquals(false, filters.length_is([1,2,3,4,5], 2));
        assertEquals(false, filters.length_is('hest', 16));
        assertEquals(false, filters.length_is(16, 4));
        assertEquals(false, filters.length_is('hest'));
    });


run();
