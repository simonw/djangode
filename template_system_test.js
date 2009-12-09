var sys = require('sys');
var template = require('./template_system');
process.mixin(GLOBAL, require('mjsunit'));

function run_testcase(testcase) {
    var test, fail, fail_cnt, success_cnt, context;

    sys.puts('====\nTESTCASE: ' + testcase.title + '\n--');

    context = testcase.setup ? context = testcase.setup() : {};
    fail_cnt = success_cnt = 0;

    for (test in testcase) {
        if (testcase.hasOwnProperty(test) && test.slice(0,4) === 'test') {
            if (testcase.before) {
                context = testcase.before(context);
            }
            fail = '';
            try {
                testcase[test].call(testcase, context);
                success_cnt++;
            } catch (e) {
                if ('stack' in e && 'type' in e) {
                    fail = e.stack;
                } else {
                    fail = e.toString();
                }
                fail_cnt++;
            }
            if (fail) {
                sys.puts('' + test + ': ' + fail);
            } else {
                sys.puts('' + test + ': passed');
            }
        }
    }

    if (fail_cnt > 0) {
        sys.puts('--\nfailed: ' + success_cnt + ' tests passed, ' + fail_cnt + ' failed\n====\n');
    } else {
        sys.puts('--\nsuccess: ' + success_cnt + ' tests passed.\n====\n');
    }

    return fail_cnt;
}

var cnt = 0;

cnt += run_testcase({
    title: 'Tokenizer tests',

    testTokenizer: function (t) {
        var tokens = template.tokenize('Hest');
        assertEquals(
            JSON.stringify([{type:'text', contents: 'Hest'}]),
            JSON.stringify(tokens)
        );
    },

    testNoEmptyTextTokens: function (t) {
        var tokens = template.tokenize('{{tag}}');
        assertEquals(
            JSON.stringify([{type:'variable', contents: ['tag']}]),
            JSON.stringify(tokens)
        );
    },

    testSplitToken: function (t) {
        assertArrayEquals(
            ['virker', 'det', 'her'],
            template.split_token('  virker det her  ')
        );
        assertArrayEquals(
            ['her', 'er', '"noget der er i qoutes"', 'og', 'noget', 'der', 'ikke', 'er'],
            template.split_token('her er "noget der er i qoutes" og noget der ikke er')
        );

        // TODO: Is this the correct result for these two tests? 
        assertArrayEquals( ['date:"F j, Y"'],     template.split_token('date:"F j, Y"'));
        assertArrayEquals( ['date:', '"F j, Y"'], template.split_token('date: "F j, Y"'));
    }
});


cnt += run_testcase({
    title: 'Context tests',

    before: function (t) {
        t.plain = {
            a: 5,
            b: 'hest',
            c: true,
            d: [ 1, 2, 3, 4 ],
        };

        var clone = JSON.parse(JSON.stringify(t.plain))

        t.context = new template.Context(clone);

        return t;
    },

    testGetFromFirstLevel: function (t) {
        for (x in t.plain) {
            if (typeof t.plain[x] === 'array') {
                assertArrayEquals(t.plain[x], t.context.get(x));
            } else {
                assertEquals(t.plain[x], t.context.get(x));
            }
        }
    },

    testGetStringLiteral: function (t) {
        assertEquals(5, t.context.get('a'));
        assertEquals('a', t.context.get("'a'"));
        assertEquals('a', t.context.get('"a"'));
    },

    testSet: function (t) {
        t.context.set('a', t.plain.a + 100);
        assertEquals(t.plain.a + 100, t.context.get('a'));
    },

    testPushAndPop: function (t) {
        t.context.push();
        assertEquals(t.plain.a, t.context.get('a'));
        t.context.pop();
        assertEquals(t.plain.a, t.context.get('a'));
    },

});


if (cnt === 0) {
    sys.puts('all tests passed. :-)');
} else {
    sys.puts('' + cnt + ' failed tests. :-(');
}

