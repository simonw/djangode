var sys = require('sys');
process.mixin(GLOBAL, require('../utils/test').dsl);
process.mixin(GLOBAL, require('./template'));

testcase('Test tokenizer');
    test('sanity test', function () {
        var tokens = tokenize('Hest');
        assertEquals([{'type': 'text', 'contents': 'Hest'}], tokens);
    });
    test('no empty tokens between tags', function () {
        var tokens = tokenize('{{tag}}');
        assertEquals( [{type:'variable', contents: 'tag'}], tokens );
    });
    test('split token contents', function () {
        assertEquals(
            ['virker', 'det', 'her'],
            split_token('  virker det her  ')
        );
        assertEquals(
            ['her', 'er', '"noget der er i qoutes"', 'og', 'noget', 'der', 'ikke', 'er'],
            split_token('her er "noget der er i qoutes" og noget der ikke er')
        );

        assertEquals( ['date:"F j, Y"'], split_token('date:"F j, Y"'));
        assertEquals( ['date:', '"F j, Y"'], split_token('date: "F j, Y"'));
    });

testcase('Filter Expression tests');
    test('should parse valid syntax', function () {
        assertEquals( 
            { variable: 'item', filter_list: [ { name: 'add' } ] },
            new FilterExpression("item|add")
        );
        assertEquals(
            { variable: 'item.subitem', filter_list: [ { name: 'add' }, { name: 'sub' } ] },
            new FilterExpression("item.subitem|add|sub")
        );
        assertEquals(
            { variable: 'item', filter_list: [ { name: 'add', arg: 5 }, { name: 'sub', arg: 2 } ] },
            new FilterExpression('item|add:"5"|sub:"2"')
        );
        assertEquals(
            { variable: 'item', filter_list: [ { name: 'concat', arg: 'heste er naijs' } ] },
            new FilterExpression('item|concat:"heste er naijs"')
        );
        assertEquals(
            { variable: 'person_name', filter_list: [ ] },
            new FilterExpression('person_name')
        );
        assertEquals(
            { constant: 335, filter_list: [{name: 'test'}] },
            new FilterExpression('335|test')
        );
        assertEquals(
            { constant: "hest", filter_list: [{name: 'test'}] },
            new FilterExpression('"hest"|test')
        );
    });

    test('should fail on invalid syntax', function () {
        function attempt(s) { return new FilterExpression(s); }

        shouldThrow(attempt, 'item |add:"2"');
        shouldThrow(attempt, 'item| add:"2"');
        shouldThrow(attempt, 'item|add :"2"');
        shouldThrow(attempt, 'item|add: "2"');
        shouldThrow(attempt, 'item|add|:"2"|sub');
    });

testcase('Context test');
    setup( function () {
        var tc = {
            plain: {
                a: 5,
                b: 'hest',
                c: true,
                d: [ 1, 2, 3, 4 ]
            }
        };

        var clone = JSON.parse( JSON.stringify(tc.plain) );
        tc.context = new Context(clone);

        return tc;
    });

    test('test get from first level', function (tc) {
        for (x in tc.plain) {
            assertEquals(tc.plain[x], tc.context.get(x));
        }
    });

    test('test get string literal', function (tc) {
        assertEquals(5, tc.context.get('a'));
        assertEquals('a', tc.context.get("'a'"));
        assertEquals('a', tc.context.get('"a"'));
    });

    test('test set', function (tc) {
        tc.context.set('a', tc.plain.a + 100);
        assertEquals(tc.plain.a + 100, tc.context.get('a'));
    });

    test('test push and pop', function (tc) {
        assertEquals(tc.plain.a, tc.context.get('a'));

        tc.context.push();

        assertEquals(tc.plain.a, tc.context.get('a'));
        tc.context.set('a', tc.plain.a + 18);
        assertEquals(tc.plain.a + 18, tc.context.get('a'));

        tc.context.pop();
        assertEquals(tc.plain.a, tc.context.get('a'));
    });

run();

