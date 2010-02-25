var sys = require('sys');
var fs = require('fs');
var template = require('./template');

process.mixin(GLOBAL, require('../utils/test').dsl);
process.mixin(GLOBAL, require('./template_defaults'));

function write_file(path, content) {
    var file = fs.openSync(path, process.O_WRONLY | process.O_TRUNC | process.O_CREAT, 0666);
    fs.writeSync(file, content);
    fs.closeSync(file);
}

function make_parse_and_execute_test(expected, tpl, name) {

    name = name ||
        'should parse "' + (tpl.length < 40 ? tpl : tpl.slice(0, 37) + ' ...') + '"' ;

    test_async(name, function (testcontext, complete) {
        var parsed = template.parse(tpl);
        parsed.render(testcontext.obj, function (error, actual) {
            if (error) {
                fail( error, complete );
            } else {
                assertEquals(expected, actual, complete);
            }
            end_async_test( complete );
        });
    });
}

testcase('fornode')
    setup( function () { return { obj: { items: [ 1,2,3,4 ], noitems: [] } }; });
    make_parse_and_execute_test(' 1  2  3  4 ', '{% for item in items %} {{ item }} {% endfor %}');
    make_parse_and_execute_test('hest',
        '{% for item in notitems %} {{ item }} {% empty %}hest{% endfor %}');

testcase('variable')
    setup( function () {
        return {
            obj: {
                num: 18,
                str: 'hest',
                bool: false,
                list: [1,2,'giraf',4],
                func: function () { return 'tobis'; },
                obj: { a: 1, b: 2, c: { d: 23, e: { f: 'laks' } } },
                qstr: '"hest"'
            }
        };
    });

    make_parse_and_execute_test('100', '{{ 100 }}');
    make_parse_and_execute_test('18', '{{ num }}');
    make_parse_and_execute_test('hest', '{{ str }}');
    make_parse_and_execute_test('tobis', '{{ func }}');
    make_parse_and_execute_test('false', '{{ bool }}');
    make_parse_and_execute_test('1,2,giraf,4', '{{ list }}');
    make_parse_and_execute_test('1', '{{ obj.a }}');
    make_parse_and_execute_test('2', '{{ obj.b }}');
    make_parse_and_execute_test('laks', '{{ obj.c.e.f }}');
    make_parse_and_execute_test('', '{{ nonexisting }}');
    make_parse_and_execute_test('&qout;hest&qout;', '{{ qstr }}');
    make_parse_and_execute_test('HEST', '{{ "hest"|upper }}');
    make_parse_and_execute_test('16', '{{ 10|add:"6" }}');
    make_parse_and_execute_test('0', '{{ 6|add:6|add:"-12" }}');


testcase('ifnode')
    setup(function () { return { obj: {a: true, b: false }}; }); 

    make_parse_and_execute_test('hest', '{% if a %}hest{% endif %}');
    make_parse_and_execute_test('', '{% if b %}hest{% endif %}');
    make_parse_and_execute_test('hest', '{% if not b %}hest{% endif %}');
    make_parse_and_execute_test('laks', '{% if b %}hest{% else %}laks{% endif %}');
    make_parse_and_execute_test('hest', '{% if not b and a %}hest{% endif %}');
    make_parse_and_execute_test('hest', '{% if a or b %}hest{% endif %}');
    make_parse_and_execute_test('hest', '{% if b or a %}hest{% endif %}');

testcase('textnode')
    make_parse_and_execute_test('heste er gode laks', 'heste er gode laks');

testcase('comment')
    make_parse_and_execute_test('', '{% comment %} do not parse {% hest %} any of this{% endcomment %}');

testcase('cycle')
    setup(function () { return { obj: { c: 'C', items: [1,2,3,4,5,6,7,8,9] }}; }); 
    make_parse_and_execute_test('a1 b2 C3 a4 b5 C6 a7 b8 C9 ',
        '{% for item in items %}{% cycle \'a\' "b" c %}{{ item }} {% endfor %}');

    make_parse_and_execute_test('a H b J c H a', 
        '{% cycle "a" "b" "c" as tmp %} {% cycle "H" "J" as tmp2 %} ' + 
        '{% cycle tmp %} {% cycle tmp2 %} {% cycle tmp %} {% cycle tmp2 %} {%cycle tmp %}',
        'should work with as tag'
    );

testcase('filter')
    make_parse_and_execute_test(
        'this text will be html-escaped &amp; will appear in all lowercase.',
        '{% filter force_escape|lower %}' +
            'This text will be HTML-escaped & will appear in all lowercase.{% endfilter %}'
    );

testcase('block and extend')
    setup(function () {
        write_file('/tmp/block_test_1.html', 'Joel is a slug');
        write_file('/tmp/block_test_2.html', 'Her er en dejlig {% block test %}hest{% endblock %}.');
        write_file('/tmp/block_test_3.html',
            '{% block test1 %}hest{% endblock %}.' 
            + '{% block test2 %} noget {% endblock %}'
        );
        write_file('/tmp/block_test_4.html',
            '{% extends "block_test_3.html" %}'
            + '{% block test1 %}{{ block.super }}{% block test3 %}{% endblock %}{% endblock %}'
            + '{% block test2 %} Et cirkus{{ block.super }}{% endblock %}'
        );

        var template_loader = require('./loader');
        template_loader.flush();
        template_loader.set_path('/tmp');

        return { obj: { parent: 'block_test_2.html' } };
    })

    make_parse_and_execute_test('her er en hestGiraf',
        '{% block test %}{% filter lower %}HER ER EN HEST{% endfilter %}Giraf{% endblock %}',
        'block should parse and evaluate');

    make_parse_and_execute_test('Joel is a slug',
        '{% extends "block_test_1.html" %}',
        'extend should parse and evaluate (without blocks)');

    make_parse_and_execute_test('Her er en dejlig giraf.',
        '{% extends "block_test_2.html" %}{% block test %}giraf{% endblock %}',
        'block should override block in extend');

    make_parse_and_execute_test('Her er en dejlig hestgiraf.',
        '{% extends "block_test_2.html" %}{% block test %}{{ block.super }}giraf{% endblock %}',
        'block.super variable should work');

    make_parse_and_execute_test('hestgiraf. Et cirkus noget tre',
        '{% extends "block_test_4.html" %}'
        + '{% block test2 %}{{ block.super }}tre{% endblock %}'
        + '{% block test3 %}giraf{% endblock %}',
        'more than two levels');

    make_parse_and_execute_test('Her er en dejlig hestgiraf.',
        '{% extends parent %}{% block test %}{{ block.super }}giraf{% endblock %}',
        'extend with variable key');

    // TODO: tests to specify behavior when blocks are name in subview but not parent

testcase('autoescape')
    setup(function () { return { obj: {test: '<script>'}}; });
    make_parse_and_execute_test('<script>',
        '{% autoescape off %}{{ test }}{% endautoescape %}',
        'there should be no escaping in "off" block');

    make_parse_and_execute_test('&lt;script&gt;',
        '{% autoescape on %}{{ test }}{% endautoescape %}',
        'there should be escaping in "on" block');

testcase('firstof')
    setup(function () { return {obj: { var1: 'hest' }}; });
    make_parse_and_execute_test('hest', '{% firstof var1 var2 var3 %}');
    make_parse_and_execute_test('hest', '{% firstof var60 var1 var3 %}');
    make_parse_and_execute_test('', '{% firstof var60 var70 var100 %}');
    make_parse_and_execute_test('fallback', '{% firstof var60 var70 var100 "fallback" %}');

testcase('with')
    test_async('function result should be cached', function (testcontext, complete) {
        var t = template.parse('{% with test.sub.func as tmp %}{{ tmp }}:{{ tmp }}{% endwith %}');
        var cnt = 0;
        var o = { test: { sub: { func: function () { cnt++; return cnt; } } } }
    
        t.render(o, function (error, result) {
            if (error) {
                fail( error, complete );
            } else {
                assertEquals('1:1', result, complete);
                assertEquals(1, cnt, complete);
            }
            end_async_test(complete);
        })
    });

testcase('ifchanged')
    setup(function () { return {obj: { list:['hest','giraf','giraf','hestgiraf'] }}; }); 
    make_parse_and_execute_test('hestgirafhestgiraf',
        '{% for item in list %}{% ifchanged %}{{ item }}{% endifchanged %}{%endfor%}'
    );
    make_parse_and_execute_test('hestgiraf::hestgiraf',
        '{% for item in list %}{% ifchanged %}{{ item }}{% else %}::{% endifchanged %}{%endfor%}'
    );

testcase('ifequal')
    setup(function () { return {obj:{item: 'hest', other: 'hest', fish: 'laks' } }; }); 

    make_parse_and_execute_test('giraf', '{% ifequal "hest" "hest" %}giraf{%endifequal %}');
    make_parse_and_execute_test('giraf', '{% ifequal item "hest" %}giraf{%endifequal %}');
    make_parse_and_execute_test('giraf', '{% ifequal item other %}giraf{%endifequal %}');
    make_parse_and_execute_test('',      '{% ifequal item fish %}giraf{%endifequal %}');
    make_parse_and_execute_test('tapir', '{% ifequal item fish %}giraf{% else %}tapir{%endifequal %}');

testcase('ifnotequal')
    setup(function () { return {obj:{item: 'hest', other: 'hest', fish: 'laks' } }; }); 

    make_parse_and_execute_test('laks', '{% ifnotequal "hest" "giraf" %}laks{%endifnotequal %}');
    make_parse_and_execute_test('laks', '{% ifnotequal item "giraf" %}laks{%endifnotequal %}');
    make_parse_and_execute_test('laks', '{% ifnotequal item fish %}laks{%endifnotequal %}');
    make_parse_and_execute_test('',     '{% ifnotequal item other %}laks{%endifnotequal %}');
    make_parse_and_execute_test('hest', '{% ifnotequal item other %}laks{% else %}hest{% endifnotequal %}');

testcase('now')
    test_async('should work as expected', function (testcontext, complete) {
        var t = template.parse('{% now "H:i" %}');
        var date = new Date();
        var expected = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' +
                       (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

        t.render({}, function (error, result) {
            if (error) {
                fail(error, complete);
            } else { 
                assertEquals(expected, result, complete);
            }
            end_async_test(complete);
        });
    });

testcase('include')
    setup(function () {
        write_file('/tmp/include_test.html', 'her er en hest{{ item }}.');

        var template_loader = require('./loader');
        template_loader.flush();
        template_loader.set_path('/tmp');

        return { obj: { name: 'include_test.html', item: 'giraf' } };
    })

    make_parse_and_execute_test('her er en hestgiraf.', '{% include "include_test.html" %}');
    make_parse_and_execute_test('her er en hestgiraf.', '{% include name %}');

testcase('load')
    make_parse_and_execute_test('hestgiraf', '{% load ./load_tag_test %}{{ 100|testfilter }}');
    make_parse_and_execute_test('hestgiraf', '{% load "./load_tag_test" %}{{ 100|testfilter }}');
    make_parse_and_execute_test('hestgiraf', '{% load ./load_tag_test %}{% testtag %}');

testcase('templatetag')
    make_parse_and_execute_test('{%', '{% templatetag openblock %}');
    make_parse_and_execute_test('%}', '{% templatetag closeblock %}');
    make_parse_and_execute_test('{{', '{% templatetag openvariable %}');
    make_parse_and_execute_test('}}', '{% templatetag closevariable %}');
    make_parse_and_execute_test('{', '{% templatetag openbrace %}');
    make_parse_and_execute_test('}', '{% templatetag closebrace %}');
    make_parse_and_execute_test('{#', '{% templatetag opencomment %}');
    make_parse_and_execute_test('#}', '{% templatetag closecomment %}');

testcase('spaceless')
    make_parse_and_execute_test('<p><a href="foo/">Foo</a></p>',
        '{% spaceless %}<p>\n        <a href="foo/">Foo</a>\n    </p>{% endspaceless %}');

testcase('widthratio')
    setup(function () { return {obj:{this_value: 175, max_value: 200 } }; }); 
    make_parse_and_execute_test('88', '{% widthratio this_value max_value 100 %}');

testcase('regroup')
    setup(function () {
        return {
            obj: {
                people: [
                    {'first_name': 'George', 'last_name': 'Bush', 'gender': 'Male'},
                    {'first_name': 'Bill', 'last_name': 'Clinton', 'gender': 'Male'},
                    {'first_name': 'Margaret', 'last_name': 'Thatcher', 'gender': 'Female'},
                    {'first_name': 'Condoleezza', 'last_name': 'Rice', 'gender': 'Female'},
                    {'first_name': 'Pat', 'last_name': 'Smith', 'gender': 'Unknown'}
                ]
            }
        };
    });

    make_parse_and_execute_test('<ul>' +
        '<li>Male:<ul><li>George Bush</li><li>Bill Clinton</li></ul></li>' +
        '<li>Female:<ul><li>Margaret Thatcher</li><li>Condoleezza Rice</li></ul></li>' +
        '<li>Unknown:<ul><li>Pat Smith</li></ul></li></ul>',
        '{% regroup people by gender as gender_list %}' + 
        '<ul>{% for gender in gender_list %}<li>{{ gender.grouper }}:' +
        '<ul>{% for item in gender.list %}<li>{{ item.first_name }} {{ item.last_name }}</li>{% endfor %}' +
        '</ul></li>{% endfor %}</ul>');

testcase('url')
    setup(function () {
        process.djangode_urls = {
            'news-views-special_case_2003': /^articles\/2003\/$/,
            'news-views-year_archive': /^articles\/(\d{4})\/$/,
            'news-views-month_archive': /^articles\/(\d{4})\/(\d{2})\/$/,
            'news-views-article_detail': /^articles\/(\d{4})\/(\d{2})\/(\d+)\/$/
        };
        return { obj: { year: 1981, month: 12, date: 2, url_name: 'news-views-article_detail' } };
    });
    teardown( function () {
        delete process.djangode_urls;
    });
    make_parse_and_execute_test("/articles/2003/", "{% url 'news-views-special_case_2003' %}");
    make_parse_and_execute_test("/articles/1981/", "{% url 'news-views-year_archive' 1981 %}");
    make_parse_and_execute_test("/articles/1981/12/", "{% url 'news-views-month_archive' 1981 , 12 %}");
    make_parse_and_execute_test("/articles/1981/12/2/", "{% url url_name year, month, date %}");

    make_parse_and_execute_test("/articles/2003/",
        "{% url 'news-views-special_case_2003' as the_url %}{{ the_url }}");
    make_parse_and_execute_test("/articles/1981/12/",
        "{% url 'news-views-month_archive' 1981, 12 as the_url %}{{ the_url }}");
run();

