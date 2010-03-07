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
        assertEquals('Tom &amp; Jerry', filters.fix_ampersands('Tom & Jerry', null, {}));
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.fix_ampersands('Tom & Jerry', {}, safety);
        assertEquals(true, safety.is_safe);
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
            filters.force_escape('<script="alert(\'din mor\')"></script>', null, {})
        );
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.force_escape('<script="alert(\'din mor\')"></script>', null, safety)
        assertEquals(true, safety.is_safe);
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
    test('should return false on incorrect length or bad arguments', function () {
        assertEquals(false, filters.length_is([1,2,3,4,5], 2));
        assertEquals(false, filters.length_is('hest', 16));
        assertEquals(false, filters.length_is(16, 4));
        assertEquals(false, filters.length_is('hest'));
    });
testcase('linebreaks')
    test('linebreaks should be converted to <p> and <br /> tags.', function () {
        assertEquals('<p>Joel<br />is a slug</p>', filters.linebreaks('Joel\nis a slug', null, {}));
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.linebreaks('Joel\nis a slug', null, safety)
        assertEquals(true, safety.is_safe);
    });
    test('string should be escaped if requsted', function () {
        var safety = { must_escape: true };
        var actual = filters.linebreaks('Two is less than three\n2 < 3', null, safety)
        assertEquals('<p>Two is less than three<br />2 &lt; 3</p>', actual)
    });
testcase('linebreaksbr')
    test('linebreaks should be converted to <br /> tags.', function () {
        assertEquals('Joel<br />is a slug.<br />For sure...',
            filters.linebreaksbr('Joel\nis a slug.\nFor sure...', null, {})
        );
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.linebreaksbr('Joel\nis a slug', null, safety)
        assertEquals(true, safety.is_safe);
    });
    test('string should be escaped if requsted', function () {
        var safety = { must_escape: true };
        var actual = filters.linebreaksbr('Two is less than three\n2 < 3', null, safety)
        assertEquals('Two is less than three<br />2 &lt; 3', actual)
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

        assertEquals(expected, filters.linenumbers(s, null, {}));
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.linenumbers('Joel\nis a slug', null, safety)
        assertEquals(true, safety.is_safe);
    });
    test('string should be escaped if requsted', function () {
        var safety = { must_escape: true };
        var actual = filters.linenumbers('Two is less than three\n2 < 3', null, safety)
        assertEquals('1. Two is less than three\n2. 2 &lt; 3', actual)
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
    // TODO: The testcase for random is pointless and should be improved
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
        assertEquals('Joel <button>is</button> a slug',
            filters.removetags('<b>Joel</b> <button>is</button> a <span\n>slug</span>', 'b span', {}));
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.removetags('<b>Joel</b> <button>is</button> a <span\n>slug</span>', 'b span', safety);
        assertEquals(true, safety.is_safe);
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
testcase('slugify');
    test('should slugify correctly', function () {
        assertEquals('joel-is-a-slug', filters.slugify('Joel is a slug'));
        assertEquals('s-str-verden-da-ikke-lngere', filters.slugify('Så står Verden da ikke længere!'));
        assertEquals('super_max', filters.slugify('Super_Max'));
    });
testcase('stringformat');
    test('return expected results', function () {
        assertEquals('002', filters.stringformat(2, '03d'));
        assertEquals('Hest', filters.stringformat('Hest', 's'));
        assertEquals('', filters.stringformat('Hest', ''));
        assertEquals('Hest      ', filters.stringformat('Hest', '-10s'));
    });
testcase('striptags');
    test('should remove tags', function () {
        assertEquals('jeg har en dejlig hest.',
            filters.striptags('<p>jeg har en <strong\n>dejlig</strong> hest.</p>', null, {})
        );
    });
    test('string should be marked as safe', function () {
        var safety = {};
        filters.striptags('<p>jeg har en <strong\n>dejlig</strong> hest.</p>', null, safety);
        assertEquals(true, safety.is_safe);
    });
testcase('title');
    test('should titlecase correctly', function () {
        assertEquals('This Is Correct', filters.title('This is correct'));
    });
testcase('truncatewords');
    test('should truncate', function () {
        assertEquals('Joel is ...', filters.truncatewords('Joel is a slug', 2));
    });
testcase('upper');
    test('should uppercase correctly', function () {
        assertEquals('JOEL IS A SLUG', filters.upper('Joel is a slug'));
    });
testcase('urlencode');
    test('should encode urls', function () {
        assertEquals('%22Aardvarks%20lurk%2C%20OK%3F%22', filters.urlencode('"Aardvarks lurk, OK?"'));
    });
testcase('safe');
    test('string should be marked as safe', function () {
        var safety = {};
        filters.safe('Joel is a slug', null, safety);
        assertEquals(true, safety.is_safe);
    });
testcase('safeseq');
    test('output should be marked as safe', function () {
        var safety = {};
        filters.safe(['hest', 'giraf'], null, safety);
        assertEquals(true, safety.is_safe);
    });
testcase('escape');
    test('output should be marked as in need of escaping', function () {
        var safety = { must_escape: false };
        filters.escape('hurra', null, safety);
        assertEquals(true, safety.must_escape);
    });
testcase('truncatewords_html');
    test('should truncate and close tags', function () {
        assertEquals('Joel is ...', filters.truncatewords_html('Joel is a slug', 2, {}));
        assertEquals('<p>Joel is ...</p>', filters.truncatewords_html('<p>Joel is a slug</p>', 2, {}));
    });
    test('should mark output as safe', function () {
        var safety = {};
        filters.truncatewords_html('<p>Joel is a slug</p>', 2, safety);
        assertEquals(true, safety.is_safe);
    });
testcase('time');
    test('correctly format time', function () {
        var t = new Date();
        t.setHours('18');
        t.setMinutes('12');
        t.setSeconds('14');
        assertEquals('18:12:14', filters.time(t, 'H:i:s'));
        assertEquals('', filters.date('hest', 'H:i:s'));
    });
testcase('timesince');
    test('should return time since', function () {
        var blog_date = new Date("1 June 2006 00:00:00");
        var comment_date = new Date("1 June 2006 08:00:00");
        assertEquals('8 hours', filters.timesince(blog_date, comment_date));
    });
testcase('timeuntil');
    test('should return time since', function () {
        var today = new Date("1 June 2006");
        var from_date = new Date("22 June 2006");
        var conference_date = new Date("29 June 2006");
        assertEquals('4 weeks', filters.timeuntil(conference_date, today));
        assertEquals('1 week', filters.timeuntil(conference_date, from_date));
    });
testcase('urlize');
    test('should urlize text', function () {
        assertEquals(
            'Check out <a href="http://www.djangoproject.com">www.djangoproject.com</a>',
            filters.urlize('Check out www.djangoproject.com', null, {})
        );
    });
    test('should escape if required', function () {
        var safety = { must_escape: true };
        assertEquals('hest &amp; giraf', filters.urlize('hest & giraf', null, safety));
    });
    test('should mark output as safe if escaped', function () {
        var safety = { must_escape: true };
        filters.urlize('hest', null, safety);
        assertEquals(true, safety.is_safe);
    });
testcase('urlizetrunc');
    test('should urlize text and truncate', function () {
        assertEquals(
            'Check out <a href="http://www.djangoproject.com">www.djangopr...</a>',
            filters.urlizetrunc('Check out www.djangoproject.com', 15, {})
        );
    });
    test('should escape if required', function () {
        var safety = { must_escape: true };
        assertEquals('hest &amp; giraf', filters.urlizetrunc('hest & giraf', 15, safety));
    });
    test('should mark output as safe if escaped', function () {
        var safety = { must_escape: true };
        filters.urlizetrunc('hest', 15, safety);
        assertEquals(true, safety.is_safe);
    });
testcase('wordcount')
    test('should count words', function () {
        assertEquals(6, filters.wordcount('I am not an atomic playboy'));
    });
testcase('yesno')
    test('should return correct value', function () {
        assertEquals('yeah', filters.yesno(true, "yeah,no,maybe"));
        assertEquals('no', filters.yesno(false, "yeah,no,maybe"));
        assertEquals('maybe', filters.yesno(null, "yeah,no,maybe"));
        assertEquals('maybe', filters.yesno(undefined, "yeah,no,maybe"));
        assertEquals('no', filters.yesno(undefined, "yeah,no"));
    });
run();

