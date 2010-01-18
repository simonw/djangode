var sys = require('sys');
var posix = require('posix');
var template = require('template/template');
var template_loader = require('template/loader');
process.mixin(GLOBAL, require('utils/test').dsl);
process.mixin(GLOBAL, require('template/template_defaults'));

function write_file(path, content) {
    var file = posix.open(path,
        process.O_WRONLY | process.O_TRUNC | process.O_CREAT, 0666).wait();
    posix.write(file, content).wait();
    posix.close(file).wait();
}



testcase('fornode')
    test('should parse and execute well formed template', function () {
        var t = template.parse('{% for item in items %} {{ item }} {% endfor %}');
        assertEquals(' 1  2  3  4 ', t.render({ items: [ 1,2,3,4 ] }));
    })

testcase('variable')
    test('should parse and execute', function () {
        var o = {   
            num: 18,
            str: 'hest',
            bool: false,
            list: [1,2,'giraf',4],
            func: function () { return 'tobis'; },
            obj: { a: 1, b: 2, c: { d: 23, e: { f: 'laks' } } }
        };
        assertEquals('100', template.parse('{{ 100 }}').render(o));
        assertEquals('18', template.parse('{{ num }}').render(o));
        assertEquals('hest', template.parse('{{ str }}').render(o));
        assertEquals('tobis', template.parse('{{ func }}').render(o));
        assertEquals('false', template.parse('{{ bool }}').render(o));
        assertEquals('1,2,giraf,4', template.parse('{{ list }}').render(o));
        assertEquals('1', template.parse('{{ obj.a }}').render(o));
        assertEquals('2', template.parse('{{ obj.b }}').render(o));
        assertEquals('laks', template.parse('{{ obj.c.e.f }}').render(o));
    })

    test('should execute filters', function () {
        assertEquals('HEST', template.parse('{{ "hest"|upper }}').render());
        assertEquals('16', template.parse('{{ 10|add:"6" }}').render());
        assertEquals('0', template.parse('{{ 6|add:"6"|add:"-12" }}').render());
    })

testcase('ifnode')
    test('should parse and execute', function () {
        var o = { a: true, b: false }
        assertEquals('hest', template.parse('{% if a %}hest{% endif %}').render(o));
        assertEquals('', template.parse('{% if b %}hest{% endif %}').render(o));
        assertEquals('hest', template.parse('{% if not b %}hest{% endif %}').render(o));
        assertEquals('laks', template.parse('{% if b %}hest{% else %}laks{% endif %}').render(o));
        assertEquals('hest', template.parse('{% if not b and a %}hest{% endif %}').render(o));
        assertEquals('hest', template.parse('{% if a or b %}hest{% endif %}').render(o));
        assertEquals('hest', template.parse('{% if b or a %}hest{% endif %}').render(o));
    })

testcase('textnode')
    test('should parse and execute', function () {
        assertEquals('heste er gode laks', template.parse('heste er gode laks').render());
    });

testcase('comment')
    test('should parse and execute', function () {
        assertEquals('', template.parse('{% comment %} do not parse {% hest %} any of this{% endcomment %}').render());
    });

testcase('cycle')
    test('should parse and execute', function () {
        var t = template.parse('{% for item in items %}{% cycle \'a\' "b" c %}{{ item }} {% endfor %}');
        var o = { c: 'C', items: [1,2,3,4,5,6,7,8,9] };
        assertEquals('a1 b2 C3 a4 b5 C6 a7 b8 C9 ', t.render(o));
    });

    test('should work with as tag', function () {
        var t = template.parse(
            '{% cycle "a" "b" "c" as tmp %} {% cycle "H" "J" as tmp2 %} ' + 
            '{% cycle tmp %} {% cycle tmp2 %} {% cycle tmp %} {% cycle tmp2 %} {%cycle tmp %}'
        );
        assertEquals('a H b J c H a', t.render());
    })
testcase('filter')
    test('should parse and execute', function () {
        var t = template.parse('{% filter force_escape|lower %}' +
            'This text will be HTML-escaped & will appear in all lowercase.{% endfilter %}');
        assertEquals(
            'this text will be html-escaped &amp; will appear in all lowercase.',
            t.render());
    });

testcase('block and extend')
    setup(function () {
        template_loader.flush();
        template_loader.set_path('/tmp');
    })

    test('block should parse and evaluate', function () {
        var t = template.parse('{% block test %}{% filter lower %}HER ER EN HEST{% endfilter %}Giraf{% endblock %}');
        assertEquals('her er en hestGiraf', t.render());
    });

    test('extend should parse and evaluate (without blocks)', function () {
        write_file('/tmp/block_test.html', 'Joel is a slug');
        var t = template.parse('{% extends "block_test.html" %}');
        assertEquals('Joel is a slug', t.render());
    });

    test('block should override block in extend', function () {
        write_file('/tmp/block_test.html', 'Her er en dejlig {% block test %}hest{% endblock %}.');
        var t = template.parse('{% extends "block_test.html" %}{% block test %}giraf{% endblock %}');
        assertEquals('Her er en dejlig giraf.', t.render());
    });

    test('block.super variable should work', function () {
        write_file('/tmp/block_test.html', 'Her er en dejlig {% block test %}hest{% endblock %}.');
        var t = template.parse(
            '{% extends "block_test.html" %}{% block test %}{{ block.super }}giraf{% endblock %}');
        assertEquals('Her er en dejlig hestgiraf.', t.render());
    });

    test('more than two levels', function () {
        write_file('/tmp/block_test1.html',
            '{% block test1 %}hest{% endblock %}.' 
            + '{% block test2 %} noget {% endblock %}'
        );
        write_file('/tmp/block_test2.html',
            '{% extends "block_test1.html" %}'
            + '{% block test1 %}{{ block.super }}{% block test3 %}{% endblock %}{% endblock %}'
            + '{% block test2 %} Et cirkus{{ block.super }}{% endblock %}'
        );

        var t = template.parse(
            '{% extends "block_test2.html" %}'
            + '{% block test2 %}{{ block.super }}tre{% endblock %}'
            + '{% block test3 %}giraf{% endblock %}'
        );

        assertEquals('hestgiraf. Et cirkus noget tre', t.render());
    });

    test('extend with variable key', function () {
        write_file('/tmp/block_test.html', 'Her er en dejlig {% block test %}hest{% endblock %}.');
        var t = template.parse(
            '{% extends parent %}{% block test %}{{ block.super }}giraf{% endblock %}');
        assertEquals('Her er en dejlig hestgiraf.', t.render({parent: 'block_test.html'}));

    });
    // TODO: tests to specify behavior when blocks are name in subview but not parent

testcase('autoescape')
    test('there should be no escaping in "off" block', function () {
        var t = template.parse('{% autoescape off %}{{ test }}{% endautoescape %}');
        assertEquals( '<script>', t.render( {test: '<script>'} ));
    });
    test('there should be escaping in "on" block', function () {
        var t = template.parse('{% autoescape on %}{{ test }}{% endautoescape %}');
        assertEquals( '&lt;script&gt;', t.render( {test: '<script>'} ));
    });
testcase('firstof')
    test('should parse and evaluate', function () {
        var t = template.parse('{% firstof var1 var2 var3 %}');
        assertEquals('hest', t.render( { var1: 'hest' } ));
        assertEquals('hest', t.render( { var2: 'hest' } ));
        assertEquals('', t.render());
        t = template.parse('{% firstof var1 var2 var3 "fallback" %}');
        assertEquals('fallback', t.render());
    });
testcase('with')
    test('function result should be cached', function () {
        var t = template.parse('{% with test.sub.func as tmp %}{{ tmp }}:{{ tmp }}{% endwith %}');
        var cnt = 0;
        var o = { test: { sub: { func: function () { cnt++; return cnt; } } } }
        assertEquals('1:1', t.render(o));
        assertEquals(1, cnt);
    });

run();

