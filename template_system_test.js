var sys = require('sys');
var template = require('./template_system');
process.mixin(GLOBAL, require('mjsunit'));
process.mixin(GLOBAL, require('./template_system'));

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
                if (typeof e === 'string') {
                    fail = e;
                } else if ('stack' in e && 'type' in e) {
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
        var tokens = tokenize('Hest');
        assertEquals(
            JSON.stringify([{type:'text', contents: 'Hest'}]),
            JSON.stringify(tokens)
        );
    },

    testNoEmptyTextTokens: function (t) {
        var tokens = tokenize('{{tag}}');
        assertEquals(
            JSON.stringify([{type:'variable', contents: 'tag'}]),
            JSON.stringify(tokens)
        );
    },

    testSplitToken: function (t) {
        assertArrayEquals(
            ['virker', 'det', 'her'],
            split_token('  virker det her  ')
        );
        assertArrayEquals(
            ['her', 'er', '"noget der er i qoutes"', 'og', 'noget', 'der', 'ikke', 'er'],
            split_token('her er "noget der er i qoutes" og noget der ikke er')
        );

        assertArrayEquals( ['date:"F j, Y"'], split_token('date:"F j, Y"'));
        assertArrayEquals( ['date:', '"F j, Y"'], split_token('date: "F j, Y"'));
    },

    testSplit_filterexpression1: function (t) {
        var actual = new FilterExpression("item|add");
        var expected = { variable: 'item', filter_list: [ { name: 'add' } ] };
        assertEquals(JSON.stringify(expected), JSON.stringify(actual));
    },

    testSplit_filterexpression2: function (t) {
        var actual = new FilterExpression("item.subitem|add|sub");
        var expected = { variable: 'item.subitem', filter_list: [ { name: 'add' }, { name: 'sub' } ] };
        assertEquals(JSON.stringify(expected), JSON.stringify(actual));
    },

    testSplit_filterexpression3: function (t) {
        var actual = new FilterExpression('item|add:"5"|sub:"2"');
        var expected = { variable: 'item', filter_list: [ { name: 'add', arg: 5 }, { name: 'sub', arg: 2 } ] }
        assertEquals(JSON.stringify(expected), JSON.stringify(actual));
    },

    testSplit_filterexpression4: function (t) {
        var actual = new FilterExpression('item|concat:"heste er naijs"');
        var expected = { variable: 'item', filter_list: [ { name: 'concat', arg: 'heste er naijs' } ] }
        assertEquals(JSON.stringify(expected), JSON.stringify(actual));
    },

    testSplit_filterexpression5: function (t) {
        var actual = new FilterExpression('person_name');
        var expected = { variable: 'person_name', filter_list: [ ] }
        assertEquals(JSON.stringify(expected), JSON.stringify(actual));
    },

    testSplit_filterexpression6: function (t) {
        var actual = new FilterExpression('"testheste er gode"');
        var expected = { constant: 'testheste er gode', filter_list: [ ] }
        assertEquals(JSON.stringify(expected), JSON.stringify(actual));
    },

    testSplit_filterexpression_error1: function (t) {
        assertThrows("new FilterExpression('item |add:\"2\"');"); // should throw "expected pipe (no spaces allowed)"
    },
    testSplit_filterexpression_error2: function (t) {
        assertThrows("new FilterExpression('item| add:\"2\"');"); // should throw "expected variable name (no spaces allowed)"
    },
    testSplit_filterexpression_error3: function (t) {
        assertThrows("new FilterExpression('item|add :\"2\"');"); // should throw "expected pipe or colon (no spaces allowed)"
    },
    testSplit_filterexpression_error4: function (t) {
        assertThrows("new FilterExpression('item|add: \"2\"');"); // should throw "expected doubleqoute (no spaces allowed or unqouted values allowed)"
    },
    testSplit_filterexpression_error5: function (t) {
        assertThrows("new FilterExpression('item|add|:\"2\"|sub');"); // should throw "expected pipe or colon (no spaces allowed)"
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

