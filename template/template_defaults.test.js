var sys = require('sys');
process.mixin(GLOBAL, require('../utils/test').dsl);
process.mixin(GLOBAL, require('./template_defaults'));

testcase('add')
    test('should add correctly', function () {
        assertEquals(6, filters.add(4, 2));
        assertEquals(6, filters.add('4', 2));
        assertEquals('', filters.add('a', 2));
        assertEquals('', filters.add(2, 'a'));
    });
testcase('addslashes')
    test('should add slashes correctly', function () {
        assertEquals('he said \\"she said\\"', filters.addslashes('he said \"she said\"'));
        assertEquals('6', filters.addslashes(6));
    });
testcase('capfirst')
    test('should capitalize first letter correctly', function () {
        assertEquals('Somewhere over the rainbow', filters.capfirst('somewhere over the rainbow'));
        assertEquals('6', filters.capfirst(6));
    });
testcase('center')
    test('center value', function () {
        assertEquals('     centered     ', filters.center('centered', 18));
        assertEquals('        6         ', filters.center(6, 18));
    })
testcase('cut')
    test('remove unwanted letters', function () {
        assertEquals('SomewhereOverTheRainbow', filters.cut('Somewhere Over The Rainbow', ' '));
    });
testcase('date')
    test('correctly format Britneys birthdate', function () {
        assertEquals('December 2, 1981', filters.date(new Date('12-02-1981'), 'F j, Y'));
        assertEquals('', filters.date('hest', 'F j, Y'));
    });
testcase('default')
    test('work as expected', function () {
        assertEquals(6, filters['default'](false, 6));  
    })
testcase('default_if_none')
    test('work as expected', function () {
        assertEquals(false, filters.default_if_none(false, 6));  
        assertEquals(6, filters.default_if_none(null, 6));  
        assertEquals(6, filters.default_if_none(undefined, 6));  
    })
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

testcase('dictsortreversed filter');
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

testcase('divisibleby filter')
    test('correctly determine if value is divisible with arg', function () {
        assertEquals(true,  filters.divisibleby(4, 2));
        assertEquals(false,  filters.divisibleby(5, 2));
        assertEquals(false,  filters.divisibleby('hest', 2));
        assertEquals(false,  filters.divisibleby('hest'));
    });

testcase('escapejs filter')
    test('correctly escape value', function () {
        assertEquals(escape('æøå&&Ø ""\n'), filters.escapejs('æøå&&Ø ""\n'));
        assertEquals('6', filters.escapejs(6));
        assertEquals('', filters.escapejs());

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
testcase('linebreaks')
    test('linebreaks should be converted to <p> and <br /> tags.', function () {
        assertEquals('<p>Joel<br />is a slug</p>', filters.linebreaks('Joel\nis a slug'));
    });
testcase('linebreaksbr')
    test('linebreaks should be converted to <br /> tags.', function () {
        assertEquals('Joel<br />is a slug.<br />For sure...', filters.linebreaksbr('Joel\nis a slug.\nFor sure...'));
    });
testcase('linenumbers')
    test('should add linenumbers to text', function () {

        var s = "But I must explain to you how all this mistaken idea of\n"
            + "denouncing pleasure and praising pain was born and I will\n"
            + "give you a complete account of the system, and expound the\n"
            + "actual teachings of the great explorer of the truth, the \n"
            + "aster-builder of human happiness. No one rejects, dislikes,\n"
            + "or avoids pleasure itself, because it is pleasure, but because\n"
            + "those who do not know how to pursue pleasure rationally\n"
            + "encounter consequences that are extremely painful. Nor again\n"
            + "is there anyone who loves or pursues or desires to obtain pain\n"
            + "of itself, because it is pain, but because occasionally\n"
            + "circumstances occur in which toil and pain can procure him\n"
            + "some great pleasure. To take a trivial example, which of us"

        var expected = "01. But I must explain to you how all this mistaken idea of\n"
            + "02. denouncing pleasure and praising pain was born and I will\n"
            + "03. give you a complete account of the system, and expound the\n"
            + "04. actual teachings of the great explorer of the truth, the \n"
            + "05. aster-builder of human happiness. No one rejects, dislikes,\n"
            + "06. or avoids pleasure itself, because it is pleasure, but because\n"
            + "07. those who do not know how to pursue pleasure rationally\n"
            + "08. encounter consequences that are extremely painful. Nor again\n"
            + "09. is there anyone who loves or pursues or desires to obtain pain\n"
            + "10. of itself, because it is pain, but because occasionally\n"
            + "11. circumstances occur in which toil and pain can procure him\n"
            + "12. some great pleasure. To take a trivial example, which of us"

        assertEquals(expected, filters.linenumbers(s));
    });
testcase('ljust')
    test('should left justify value i correctly sized field', function () {
        assertEquals('hest      ', filters.ljust('hest', 10)); 
        assertEquals('', filters.ljust('hest')); 
        assertEquals('he', filters.ljust('hest', 2)); 
    });
testcase('lower')
    test('should lowercase value', function () {
        assertEquals('somewhere over the rainbow', filters.lower('Somewhere Over the Rainbow'));
        assertEquals('', filters.lower(19));
    });
testcase('make_list');
    test('work as expected', function () {
        assertEquals(['J', 'o', 'e', 'l'], filters.make_list('Joel'));
        assertEquals(['1', '2', '3'], filters.make_list('123'));
    });
testcase('phone2numeric')
    test('convert letters to numbers phone number style', function () {
        assertEquals('800-2655328', filters.phone2numeric('800-COLLECT'));
        assertEquals('2223334445556667q77888999z', filters.phone2numeric('abcdefghijklmnopqrstuvwxyz'));
    });
testcase('pluralize');
    test('pluralize correctly', function() {
        assertEquals('', filters.pluralize('sytten'));
        assertEquals('', filters.pluralize(1));
        assertEquals('s', filters.pluralize(2));
        assertEquals('', filters.pluralize(1, 'es'));
        assertEquals('es', filters.pluralize(2, 'es'));
        assertEquals('y', filters.pluralize(1, 'y,ies'));
        assertEquals('ies', filters.pluralize(2, 'y,ies'));
    });
testcase('pprint');
    test("should not throw and not return ''", function () {
        var response = filters.pprint( filters );
        if (!response) { fail('response is empty!'); }
    });
testcase('random');
    test('should return an element from the list', function () {
        var arr = ['h', 'e', 's', 't'];
        var response = filters.random(arr);
        if (arr.indexOf(response) < 0) {
            fail('returned element not in array!');
        }
    });
    test('should return empty string when passed non array', function () {
        assertEquals('', filters.random( 25 ));
    });
testcase('removetags');
    test('should remove tags', function () {
        assertEquals('jeg har en dejlig hest.', filters.removetags('<p>jeg har en <strong\n>dejlig</strong> hest.</p>'));
    });
testcase('rjust')
    test('should right justify value in correctly sized field', function () {
        assertEquals('      hest', filters.rjust('hest', 10)); 
        assertEquals('', filters.rjust('hest')); 
        assertEquals('he', filters.rjust('hest', 2)); 
    });
testcase('slice')
    var arr = [0,1,2,3,4,5,6,7,8,9];
    test('slice should slice like python', function () {
        assertEquals([0,1,2,3], filters.slice(arr, ":4"));
        assertEquals([6,7,8,9], filters.slice(arr, "6:"));
        assertEquals([2,3,4], filters.slice(arr, "2:5"));
        assertEquals([2,5,8], filters.slice(arr, "2::3"));
        assertEquals([2,5], filters.slice(arr, "2:6:3"));
    });
    test('slice should handle bad values', function () {
        assertEquals([],        filters.slice(36, ":4"));
        assertEquals([0,1,2,3,4,5,6,7,8,9], filters.slice(arr, 'hest'));
        assertEquals([0,1,2,3,4,5,6,7,8,9], filters.slice(arr));
    });

run();

