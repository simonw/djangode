var sys = require('sys');
process.mixin(GLOBAL, require('utils/test').dsl);
process.mixin(GLOBAL, require('template/template'));

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
            tokenize('  virker det her  ')[0].split_contents()
        );
        assertEquals(
            ['her', 'er', '"noget der er i qoutes"', 'og', 'noget', 'der', 'ikke', 'er'],
            tokenize('her er "noget der er i qoutes" og noget der ikke er')[0].split_contents()
        );

        assertEquals( ['date:"F j, Y"'], tokenize('date:"F j, Y"')[0].split_contents());
        assertEquals( ['date:', '"F j, Y"'], tokenize('date: "F j, Y"')[0].split_contents());
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
            { variable: 'item', filter_list: [ { name: 'add', var_arg: 5 }, { name: 'sub', arg: "2" } ] },
            new FilterExpression('item|add:5|sub:"2"')
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
            { variable: 335, filter_list: [{name: 'test'}] },
            new FilterExpression('335|test')
        );
        assertEquals(
            { constant: "hest", filter_list: [{name: 'test'}] },
            new FilterExpression('"hest"|test')
        );
        assertEquals(
            { variable: "item", filter_list: [{name: 'add', var_arg: 'other' }] },
            new FilterExpression('item|add:other')
        );
    });

    test('should fail on invalid syntax', function () {
        function attempt(s) { return new FilterExpression(s); }

        shouldThrow(attempt, 'item |add:2');
        shouldThrow(attempt, 'item| add:2');
        shouldThrow(attempt, 'item|add :2');
        shouldThrow(attempt, 'item|add: 2');
        shouldThrow(attempt, 'item|add|:2|sub');
        shouldThrow(attempt, 'item|add:2 |sub');
    });

    test('output (without filters) should be escaped if autoescaping is on', function () {
        var context = new Context({test: '<script>'});
        context.autoescaping = true;
        var expr = new FilterExpression("test");
        assertEquals('&lt;script&gt;', expr.resolve(context));
    });

    test('output (without filters) should not be escaped if autoescaping is off', function () {
        var context = new Context({test: '<script>'});
        context.autoescaping = false;
        var expr = new FilterExpression("test");
        assertEquals('<script>', expr.resolve(context));
    });
    test('safe filter should prevent escaping', function () {
        var context = new Context({test: '<script>'});
        context.autoescaping = true;
        var expr = new FilterExpression("test|safe|upper");
        assertEquals('<SCRIPT>', expr.resolve(context));
    });
    test('escape filter should force escaping', function () {
        var context = new Context({test: '<script>'});
        context.autoescaping = false;
        var expr = new FilterExpression("test|escape|upper");
        assertEquals('&lt;SCRIPT&gt;', expr.resolve(context));
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

testcase('parser')
    test('should parse', function () {
        t = parse('hest');
        assertEquals('hest', t.render());
    });
    test('node_list only_types should return only requested typed', function () {
        t = parse('{% comment %}hest{% endcomment %}hest{% comment %}laks{% endcomment %}{% hest %}');
        assertEquals(['comment','comment'], t.node_list.only_types('comment').map(function(x){return x.type}));
        assertEquals(['text','UNKNOWN'], t.node_list.only_types('text', 'UNKNOWN').map(function(x){return x.type}));
    });

run();

