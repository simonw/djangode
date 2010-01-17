/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var sys = require('sys');

var template = require('template/template');
var utils = require('utils/utils');

/* TODO: Missing filters

    Don't know how:
        iriencode

    Not implemented (yet):
        time
        timesince
        timeuntil
        truncatewords_html
        unordered_list
        urlize
        urlizetrunc
        wordcount
        wordwrap
        yesno

NOTE:
    date() filter is not lozalized and has a few gotchas...
    stringformat() filter is regular sprintf compliant and doesn't have real python syntax

Missing tags:
    for ( missing 'empty' tag )

    include
    ssi
    load

    debug
    firstof
    ifchanged
    ifequal
    ifnotequal
    now
    regroup
    spaceless
    templatetag
    url
    widthratio
    with

NOTE:
    cycle tag does not support legacy syntax (row1,row2,row3)
*/

var filters = exports.filters = {
    add: function (value, arg) {
        value = value - 0;
        arg = arg - 0;
        return (isNaN(value) || isNaN(arg)) ? '' : (value + arg);
    },
    addslashes: function (value, arg) { return utils.string.add_slashes("" + value); },
    capfirst: function (value, arg) { return utils.string.cap_first("" + value); },
    center: function (value, arg) { return utils.string.center("" + value, arg); },
    cut: function (value, arg) { return ("" + value).replace(new RegExp(arg, 'g'), ""); },
    date: function (value, arg) { return (value instanceof Date) ? utils.date.date(arg, value) : ''; },
    'default': function (value, arg) { return value ? value : arg; },
    default_if_none: function (value, arg) { return (value === null || value === undefined) ? arg : value; },

    dictsort: function (value, arg) {
        var clone = value.slice(0);
        clone.sort(function (a, b) { return a[arg] < b[arg] ? -1 : a[arg] > b[arg] ? 1 : 0; });
        return clone;
    },

    dictsortreversed: function (value, arg) {
        var tmp = filters.dictsort(value, arg);
        tmp.reverse();
        return tmp;
    },
    divisibleby: function (value, arg) { return value % arg === 0; },

    escape: function (value, arg, safety) {
        safety.must_escape = true;
        return value;
    },
    escapejs: function (value, arg) { return escape(value || ''); },
    filesizeformat: function (value, arg) {
        var bytes = value - 0;
        if (isNaN(bytes)) { return "0 bytes"; }
        if (bytes <= 1) { return '1 byte'; }
        if (bytes < 1024) { return bytes.toFixed(0) + ' bytes'; }
        if (bytes < 1024 * 1024) { return (bytes / 1024).toFixed(1) + 'KB'; }
        if (bytes < 1024 * 1024 * 1024) { return (bytes / (1024 * 1024)).toFixed(1) + 'MB'; }
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    },
    first: function (value, arg) { return (value instanceof Array) ? value[0] : ""; },
    fix_ampersands: function (value, arg, safety) {
        safety.is_safe = true;
        return ("" + value).replace('&', '&amp;');
    },
    floatformat: function (value, arg) {
        arg = arg || -1;
        var num = value - 0,
            show_zeroes = arg > 0,
            fix = Math.abs(arg);
        if (isNaN(num)) {
            return '';
        }
        var s = num.toFixed(fix);
        if (!show_zeroes && s % 1 === 0) {
            return num.toFixed(0);
        }
        return s;
    },
    force_escape: function (value, arg, safety) {
        safety.is_safe = true;
        return utils.html.escape("" + value);
    },
    get_digit: function (value, arg) {
        if (typeof value !== 'number' || typeof arg !== 'number' || typeof arg < 1) { return value; }
        var s = "" + value;
        return s[s.length - arg] - 0;
    },
    iriencode: function (value, arg) {
        // TODO: implement iriencode filter
        throw "iri encoding is not implemented";
    },
    join: function (value, arg) { return (value instanceof Array) ? value.join(arg) : ''; },
    last: function (value, arg) { return ((value instanceof Array) && value.length) ? value[value.length - 1] : ''; },
    length: function (value, arg) { return value.length ? value.length : 0; },
    length_is: function (value, arg) { return value.length === arg; },
    linebreaks: function (value, arg, safety) {
        if (!safety.is_safe && safety.must_escape) {
            value = utils.html.escape("" + value);
        }
        safety.is_safe = true;
        return utils.html.linebreaks("" + value);
    },
    linebreaksbr: function (value, arg, safety) {
        if (!safety.is_safe && safety.must_escape) {
            value = utils.html.escape("" + value);
        }
        safety.is_safe = true;
        return "" + value.replace(/\n/g, '<br />');
    },
    linenumbers: function (value, arg, safety) {
        var lines = String(value).split('\n');
        var len = String(lines.length).length;

        // TODO: escape if string is not safe, and autoescaping is active
        var out = lines
            .map(function (s, idx) {
                if (!safety.is_safe && safety.must_escape) {
                    s = utils.html.escape("" + s);
                }
                return utils.string.sprintf('%0' + len + 'd. %s', idx + 1, s); })
            .join('\n');
        safety.is_safe = true;
        return out;
    },
    ljust: function (value, arg) {
        try {
            return utils.string.sprintf('%-' + arg + 's', value).substr(0, arg);
        } catch (e) {
            return '';
        }
    },
    lower: function (value, arg) { return typeof value === 'string' ? value.toLowerCase() : ''; },
    make_list: function (value, arg) { return String(value).split(''); },
    phone2numeric: function (value, arg) {
        value = String(value).toLowerCase();
        return value.replace(/[a-pr-y]/g, function (x) {
            var code = x.charCodeAt(0) - 91;
            if (code > 22) { code = code - 1; }
            return Math.floor(code / 3);
        });
    },
    pluralize: function (value, arg) {
        value = Number(value);
        var plural = arg ? String(arg).split(',') : ['', 's'];
        if (plural.length === 1) { plural.unshift(''); }
        if (isNaN(value)) { return ''; }
        return value === 1 ? plural[0] : plural[1];
    },
    pprint: function (value, arg) { return JSON.stringify(value); },
    random: function (value, arg) {
        return (value instanceof Array) ? value[ Math.floor( Math.random() * value.length ) ] : '';
    },
    removetags: function (value, arg, safety) {
        arg = String(arg).replace(/\s+/g, '|');
        var re = new RegExp( '</?\\s*(' + arg + ')\\b[^>]*/?>', 'ig');
        safety.is_safe = true;
        return String(value).replace(re, '');
    },
    rjust: function (value, arg) {
        try {
            return utils.string.sprintf('%' + arg + 's', value).substr(0, arg);
        } catch (e) {
            return '';
        }
    },
    safe: function (value, arg, safety) {
        safety.is_safe = true;
        return value;
    },
    safeseq: function (value, arg) {
        safety.is_safe = true;
        return value;
    },
    slice: function (value, arg) {
        if (!(value instanceof Array)) { return []; }
        var parts = (arg || '').split(/:/g);
        
        if (parts[1] === '') {
            parts[1] = value.length;
        }
        parts = parts.map(Number);

        if (!parts[2]) {
            return value.slice(parts[0], parts[1]);
        }
        var out = [], i = parts[0], end = parts[1];
        for (;i < end; i += parts[2]) {
            out.push(value[i]);
        }
        return out;

    },
    slugify: function (value, arg) {
        return String(value).toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    },
    stringformat: function (value, arg) {
        try { return utils.string.sprintf('%' + arg, value); } catch (e) { return ''; }
    },
    striptags: function (value, arg, safety) {
        safety.is_safe = true;
        return String(value).replace(/<(.|\n)*?>/g, '');
    },
    title: function (value, arg) {
        return utils.string.titleCaps( String(value) );
    },
    truncatewords: function (value, arg) {
        return String(value).split(/\s+/g).slice(0, arg).join(' ') + ' ...';
    },
    upper: function (value, arg) {
        return (value + '').toUpperCase();
    },
    urlencode: function (value, arg) {
        return escape(value);
    }
};


var nodes = exports.nodes = {

    TextNode: function (text) {
        return function () { return text; };
    },

    VariableNode: function (filterexpression) {
        return function (context) {
            return filterexpression.resolve(context);
        };
    },

    ForNode: function (itemname, listname, node_list, isReversed) {

        return function (context) {
            var forloop = { parentloop: context.get('forloop') },
                list = context.get(listname),
                out = '';

            if (! list instanceof Array) { return nodes.TextNode(''); }
            if (isReversed) { list = list.slice(0).reverse(); }

            context.push();
            context.set('forloop', forloop);

            list.forEach( function (o, idx, iter) {
                process.mixin(forloop, {
                    counter: idx + 1,
                    counter0: idx,
                    revcounter: iter.length - idx,
                    revcounter0: iter.length - (idx + 1),
                    first: idx === 0,
                    last: idx === iter.length - 1
                });
                context.set(itemname, o);

                out += node_list.evaluate( context );
            });

            context.pop();

            return out;
        };
    },

    IfNode: function (item_names, not_item_names, operator, if_node_list, else_node_list) {

        return function (context) {

            function not(x) { return !x; }
            function and(p,c) { return p && c; }
            function or(p,c) { return p || c; }

            var items = item_names.map( context.get, context ).concat(
                not_item_names.map( context.get, context ).map( not )
            );

            var isTrue = items.reduce( operator === 'or' ? or : and, true );

            if (isTrue) {
                return if_node_list.evaluate( context );
            } else if (else_node_list.length) {
                return else_node_list.evaluate( context );
            } else {
                return '';
            }
        };
    },

    CycleNode: function (items) {

        var cnt = 0;

        return function (context) {

            var choices = items.map( context.get, context );
            var val = choices[cnt];
            cnt = (cnt + 1) % choices.length;
            return val;
        };
    },

    FilterNode: function (expression, node_list) {
        return function (context) {
            expression.constant = node_list.evaluate( context );
            return expression.resolve(context);
        };
    },

    BlockNode: function (name, node_list) {

        return function (context) {

            var out = '';

            // init block list if it isn't already
            if (!context.blocks[name]) {
                context.blocks[name] = [];
            }

            // put this block in front of list
            context.blocks[name].unshift( node_list );

            // if this is a root template descend through templates and evaluate blocks for overrides
            if (!context.extends) {
                context.push();

                context.blocks[name].forEach( function (list) {
                    out = list.evaluate( context );
                    context.set('block', { super: out });
                });

                context.pop();
            }

            return out;
        };
    },

    ExtendsNode: function (item) {
        return function (context) {
            context.extends = context.get(item);
            return '';
        };
    },

    AutoescapeNode: function (enable, node_list) {
        return function (context) {
            var before = context.autoescaping;
            context.autoescaping = enable;
            out = node_list.evaluate( context );
            context.autoescaping = before;
            return out;
        }
    }

};

var callbacks = exports.callbacks = {
    'text': function (parser, token) { return nodes.TextNode(token.contents); },

    'variable': function (parser, token) {
        return nodes.VariableNode( new template.FilterExpression(token.contents) );
    },

    'comment': function (parser, token) {
        parser.parse('endcomment');
        parser.delete_first_token();
        return nodes.TextNode('');
    },

    'for': function (parser, token) {
        
        var parts = template.split_token(token.contents);

        if (parts[0] !== 'for' || parts[2] !== 'in' || (parts[4] && parts[4] !== 'reversed')) {
            throw 'unexpected syntax in "for" tag: ' + token.contents;
        }
        
        var itemname = parts[1],
            listname = parts[3],
            isReversed = (parts[4] === 'reversed'),
            node_list = parser.parse('endfor');

        parser.delete_first_token();

        return nodes.ForNode(itemname, listname, node_list, isReversed);
    },
    
    'if': function (parser, token) {

        var parts = template.split_token( token.contents );

        if (parts[0] !== 'if') { throw 'unexpected syntax in "if" tag'; }

        // get rid of if keyword
        parts.shift();

        var operator = '',
            item_names = [],
            not_item_names = [];

        var p, next_should_be_item = true;

        while (p = parts.shift()) {
            if (next_should_be_item) {
                if (p === 'not') {
                    p = parts.shift();
                    if (!p) { throw 'unexpected syntax in "if" tag. Expected item name after not'; }
                    not_item_names.push( p );
                } else {
                    item_names.push( p );
                }
                next_should_be_item = false;
            } else {
                if (p !== 'and' && p !== 'or') { throw 'unexpected syntax in "if" tag. Expected "and" or "or"'; }
                if (operator && p !== operator) { throw 'unexpected syntax in "if" tag. Cannot mix "and" and "or"'; }
                operator = p;
                next_should_be_item = true;
            }
        }

        var node_list, else_list = [];
        
        node_list = parser.parse('else', 'endif');
        if (parser.next_token().type === 'else') {
            else_list = parser.parse('endif');
            parser.delete_first_token();
        }

        return nodes.IfNode(item_names, not_item_names, operator, node_list, else_list);
    },

    'cycle': function (parser, token) {
        var parts = template.split_token(token.contents);

        if (parts[0] !== 'cycle') { throw 'unexpected syntax in "cycle" tag'; }

        var items = parts.slice(1);
        var as_idx = items.indexOf('as');
        var name = '';

        if (items.length === 1) {
            if (!parser.cycles || !parser.cycles[items[0]]) {
                throw 'no cycle named ' + items[0] + '!';
            } else {
                return parser.cycles[items[0]];
            }
        }

        if (as_idx > 0) {
            if (as_idx === items.length - 1) {
                throw 'unexpected syntax in "cycle" tag. Expected name after as';
            }

            name = items[items.length - 1];
            items = items.slice(0, items.length - 2);

            if (!parser.cycles) { parser.cycles = {}; }
            parser.cycles[name] = nodes.CycleNode(items);
            return parser.cycles[name];
        }

        return nodes.CycleNode(items);
    },

    'filter': function (parser, token) {
        var parts = template.split_token(token.contents);
        if (parts[0] !== 'filter' || parts.length > 2) { throw 'unexpected syntax in "filter" tag'; }

        var expr = new template.FilterExpression('|' + parts[1], ' ');

        var node_list = parser.parse('endfilter');
        parser.delete_first_token();

        return nodes.FilterNode(expr, node_list);
    },
    
    'block': function (parser, token) {
        var parts = template.split_token(token.contents);
        if (parts[0] !== 'block' || parts.length !== 2) { throw 'unexpected syntax in "block" tag'; }
        var name = parts[1];

        var node_list = parser.parse('endblock');
        parser.delete_first_token();

        return nodes.BlockNode(name, node_list);
    },

    'extends': function (parser, token) {
        var parts = template.split_token(token.contents);
        if (parts[0] !== 'extends' || parts.length !== 2) { throw 'unexpected syntax in "extends" tag'; }
        var name = parts[1];

        return nodes.ExtendsNode(name);
    },

    'autoescape': function (parser, token) {
        var parts = template.split_token(token.contents);
        if (parts[0] !== 'autoescape' || parts.length !== 2) { throw 'unexpected syntax in "autoescape" tag'; }
        var enable;
        if (parts[1] === 'on') {
            enable = true;
        } else if (parts[1] === 'off' ) {
            enable = false;
        } else {
            throw 'unexpected syntax in "autoescape" tag. Expected on or off';
        }

        var node_list = parser.parse('endautoescape');
        parser.delete_first_token();

        return nodes.AutoescapeNode(enable, node_list);
    }

};





