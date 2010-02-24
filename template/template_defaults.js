/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var sys = require('sys');
var utils = require('utils/utils');

/* TODO: Missing filters

    Don't know how:
        iriencode

    Not implemented (yet):
        unordered_list

NOTE:
    stringformat() filter is regular sprintf compliant and doesn't have real python syntax

Missing tags:
    for ( missing 'empty' tag )

    include
    ssi
    load

    debug

    regroup
    spaceless
    templatetag
    url
    widthratio

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
    center: function (value, arg) { return utils.string.center("" + value, arg - 0); },
    cut: function (value, arg) { return ("" + value).replace(new RegExp(arg, 'g'), ""); },
    date: function (value, arg) {
        // TODO: this filter may be unsafe...
        return (value instanceof Date) ? utils.date.format_date(value, arg) : '';
    },
    'default': function (value, arg) {
        // TODO: this filter may be unsafe...
        return value ? value : arg;
    },
    default_if_none: function (value, arg) {
        // TODO: this filter may be unsafe...
        return (value === null || value === undefined) ? arg : value;
    },

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
        arg = arg - 0 || -1;
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
        if (typeof value !== 'number' || typeof arg !== 'number' || arg < 1) { return value; }
        var s = "" + value;
        return s[s.length - arg] - 0;
    },
    iriencode: function (value, arg) {
        // TODO: implement iriencode filter
        throw "iri encoding is not implemented";
    },
    join: function (value, arg) {
        // TODO: this filter may be unsafe...
        return (value instanceof Array) ? value.join(arg) : '';
    },
    last: function (value, arg) { return ((value instanceof Array) && value.length) ? value[value.length - 1] : ''; },
    length: function (value, arg) { return value.length ? value.length : 0; },
    length_is: function (value, arg) { return value.length === arg; },
    linebreaks: function (value, arg, safety) {
        var out = utils.html.linebreaks("" + value, { escape: !safety.is_safe && safety.must_escape });
        safety.is_safe = true;
        return out;
    },
    linebreaksbr: function (value, arg, safety) {
        var out = utils.html.linebreaks("" + value, { onlybr: true, escape: !safety.is_safe && safety.must_escape });
        safety.is_safe = true;
        return out;
    },
    linenumbers: function (value, arg, safety) {
        var lines = String(value).split('\n');
        var len = String(lines.length).length;

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
        arg = arg - 0;
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
        // TODO: this filter may not be safe
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
        // TODO: this filter may not be safe
        try { return utils.string.sprintf('%' + arg, value); } catch (e) { return ''; }
    },
    striptags: function (value, arg, safety) {
        safety.is_safe = true;
        return String(value).replace(/<(.|\n)*?>/g, '');
    },
    title: function (value, arg) {
        return utils.string.titleCaps( String(value) );
    },
    time: function (value, arg) {
        // TODO: this filter may not be safe
        return (value instanceof Date) ? utils.date.format_time(value, arg) : '';
    },
    timesince: function (value, arg) {
        // TODO: this filter may not be safe (if people decides to put & or " in formatstrings"
        value = new Date(value);
        arg = new Date(arg);
        if (isNaN(value) || isNaN(arg)) { return ''; }
        return utils.date.timesince(value, arg);
    },
    timeuntil: function (value, arg) {
        // TODO: this filter may not be safe (if people decides to put & or " in formatstrings"
        value = new Date(value);
        arg = new Date(arg);
        if (isNaN(value) || isNaN(arg)) { return ''; }
        return utils.date.timeuntil(value, arg);
    },
    truncatewords: function (value, arg) {
        return String(value).split(/\s+/g).slice(0, arg).join(' ') + ' ...';
    },
    truncatewords_html: function (value, arg, safety) {
        safety.is_safe = true;
        return utils.html.truncate_html_words(value, arg - 0);
    },
    upper: function (value, arg) {
        return (value + '').toUpperCase();
    },
    urlencode: function (value, arg) {
        return escape(value);
    },
    urlize: function (value, arg, safety) {
        if (!safety.is_safe && safety.must_escape) {
            var out = utils.html.urlize(value + "", { escape: true });
            safety.is_safe = true;
            return out;
        }
        return utils.html.urlize(value + "");
    },
    urlizetrunc: function (value, arg, safety) {
        if (!safety.is_safe && safety.must_escape) {
            var out = utils.html.urlize(value + "", { escape: true, limit: arg });
            safety.is_safe = true;
            return out;
        }
        return utils.html.urlize(value + "", { limit: arg });
    },
    wordcount: function (value, arg) {
        return (value + "").split(/\s+/g).length;
    },
    wordwrap: function (value, arg) {
        return utils.wordwrap(value + "", arg - 0);
    },
    yesno: function (value, arg) {
        var responses = (arg + "").split(/,/g);
        if (responses[2] && (value === undefined || value === null)) { return responses[2]; }
        return (value ? responses[0] : responses[1]) || '';
    }

};


var nodes = exports.nodes = {

    TextNode: function (text) {
        return function (context, callback) { callback(false, text); };
    },

    VariableNode: function (filterexpression) {
        return function (context, callback) {
            callback(false, filterexpression.resolve(context));
        };
    },

    ForNode: function (itemname, listname, node_list, isReversed) {

        return function (context, callback) {
            var forloop = { parentloop: context.get('forloop') },
                list = context.get(listname),
                out = '';

            if (! list instanceof Array) { return nodes.TextNode(''); }
            if (isReversed) { list = list.slice(0).reverse(); }

            context.push();
            context.set('forloop', forloop);

            function inner(p, c, idx, list, next) {
                process.mixin(forloop, {
                    counter: idx + 1,
                    counter0: idx,
                    revcounter: list.length - idx,
                    revcounter0: list.length - (idx + 1),
                    first: idx === 0,
                    last: idx === list.length - 1
                });
                context.set(itemname, c);

                node_list.evaluate( context, function (error, result) { next(error, p + result); });
            }

            utils.iter.reduce(list, inner, '', function (error, result) {
                context.pop();
                callback(error, result);
            });
        };
    },

    IfNode: function (item_names, not_item_names, operator, if_node_list, else_node_list) {

        return function (context, callback) {

            function not(x) { return !x; }
            function and(p,c) { return p && c; }
            function or(p,c) { return p || c; }

            var items = item_names.map( context.get, context ).concat(
                not_item_names.map( context.get, context ).map( not )
            );

            var isTrue = items.reduce( operator === 'or' ? or : and, true );

            if (isTrue) {
                if_node_list.evaluate(context, function (error, result) { callback(error, result); });
            } else if (else_node_list.length) {
                else_node_list.evaluate(context, function (error, result) { callback(error, result); });
            } else {
                callback(false, '');
            }
        };
    },

    IfChangedNode: function (node_list) {
        var last;

        return function (context, callback) {
            node_list.evaluate(context, function (error, result) {
                if (result !== last) {
                    last = result;
                    callback(error, result);
                } else {
                    callback(error, '');
                }
            });
        };
    },

    IfEqualNode: function (node_list, first, second) {
        return function (context, callback) {
            if (context.get(first) == context.get(second)) {
                node_list.evaluate(context, callback);
            } else {
                callback(false, '');
            }
        };
    },

    IfNotEqualNode: function (node_list, first, second) {
        return function (context, callback) {
            if (context.get(first) != context.get(second)) {
                node_list.evaluate(context, callback);
            } else {
                callback(false, '');
            }
        };
    },


    CycleNode: function (items) {

        var cnt = 0;

        return function (context, callback) {

            var choices = items.map( context.get, context );
            var val = choices[cnt];
            cnt = (cnt + 1) % choices.length;
            callback(false, val);
        };
    },

    FilterNode: function (expression, node_list) {
        return function (context, callback) {
            node_list.evaluate( context, function (error, constant) {
                expression.constant = constant;
                callback(error, expression.resolve(context));
            });
        };
    },

    BlockNode: function (node_list, name) {

        /* upon execution each block stores it's nodelist in the context
         * indexed by the blocks name. As templates are executed from child to
         * parent, similar named blocks add their nodelist to an array of
         * nodelists (still indexed by the blocks name). When the root template
         * is reached, the blocks nodelists are executed one after each other
         * and the super variable is updated down through the hierachy.
        */
        return function (context, callback) {

            // init block list if it isn't already
            if (!context.blocks[name]) {
                context.blocks[name] = [];
            }

            // put this block in front of list
            context.blocks[name].unshift( node_list );

            // if this is a root template descend through templates and evaluate blocks for overrides
            if (!context.extends) {

                context.push();

                function inner(p, c, idx, block_list, next) {
                    c.evaluate( context, function (error, result) {
                        context.set('block', { super: result });
                        next(error, result);
                    });
                }
                utils.iter.reduce( context.blocks[name], inner, '', function (error, result) {
                    context.pop();
                    callback(error, result);
                });

            } else {
                // else return empty string
                callback(false, '');
            }
        };
    },

    ExtendsNode: function (item) {
        return function (context, callback) {
            context.extends = context.get(item);
            callback(false, '');
        };
    },

    AutoescapeNode: function (node_list, enable) {

        if (enable.toLowerCase() === 'on') {
            enable = true;
        } else {
            enable = false;
        }

        return function (context, callback) {
            var before = context.autoescaping;
            context.autoescaping = enable;
            node_list.evaluate( context, function ( error, result ) {
                context.autoescaping = before;
                callback(error, result);
            });
        }
    },

    FirstOfNode: function (/*...*/) {
    
        var choices = Array.prototype.slice.apply(arguments);

        return function (context, callback) {
            var i, val, found;
            for (i = 0; i < choices.length; i++) {
                val = context.get(choices[i]);
                if (val) { found = true; break; }
            }
            callback(false, found ? val : '')
        };
    },

    WithNode: function (node_list, variable, name) {
        return function (context, callback) {
            var item = context.get(variable);
            context.push();
            context.set(name, item);
            node_list.evaluate( context, function (error, result) {
                context.pop();
                callback(error, result);
            });
        }
    },

    NowNode: function (format) {
        if (format.match(/^["']/)) {
            format = format.slice(1, -1);
        }
        return function (context, callback) {
            callback(false, utils.date.format_date(new Date(), format));
        };
    }

};


function assert_args_in_token(token, options) {
    options = options || {};

    var parts = token.split_contents();

    if (options.argcount !== undefined && parts.length !== options.argcount + 1) {
        throw 'unexpected syntax in "' + token.type + '" tag: Wrong number of arguments';
    }

    var i;
    for (i = 1; i < parts.length; i++) {
        if (options[i + 'mustbe']) {
            var expected = options[i + 'mustbe'];
            if (expected instanceof Array) {
                if (expected.indexOf(parts[i]) === -1) {
                    throw 'unexpected syntax in "' + token.type + '" tag: Expected one of "' + expected.join('", "') + '"';
                }
            } else if (expected != parts[i]) {
                throw 'unexpected syntax in "' + token.type + '" tag: Expected "' + options[i + 'mustbe'] + '"';
            }
        }
    }

    if (options.exclude) {
        if (!(options.exclude instanceof Array)) { options.exclude = [options.exclude] }
        var include = [];
        for (i = 1; i < parts.length; i++) {
            if (options.exclude.indexOf(i) === -1) { include.push(i); }
        }
        parts = include.map(function (x) { return parts[x]; });
    } else {
        parts = parts.slice(1);
    }

    return parts;
}


function simple_tag(node, options) {

    return function (parser, token) {
        var parts = assert_args_in_token(token, options);
        return node.apply(null, parts);
    };

}

function inclusion_tag(node, options) {
    return function (parser, token) {

        var parts = assert_args_in_token(token, options);

        var node_list = parser.parse('end' + token.type);
        parser.delete_first_token();

        return node.apply(null, [node_list].concat(parts));
    };
}

var tags = exports.tags = {
    'text': function (parser, token) { return nodes.TextNode(token.contents); },

    'variable': function (parser, token) {
        return nodes.VariableNode( parser.make_filterexpression(token.contents) );
    },

    'comment': function (parser, token) {
        parser.parse('end' + token.type);
        parser.delete_first_token();
        return nodes.TextNode('');
    },

    'for': function (parser, token) {
        
        var parts = token.split_contents();

        if (parts[2] !== 'in' || (parts[4] && parts[4] !== 'reversed')) {
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

        var parts = token.split_contents();

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

    // TODO: else
    'ifchanged': inclusion_tag(nodes.IfChangedNode, { argcount: 0 }),

    // TODO: else
    'ifequal': inclusion_tag(nodes.IfEqualNode, { argcount: 2 }),

    // TODO: else
    'ifnotequal': inclusion_tag(nodes.IfNotEqualNode, { argcount: 2 }),

    'cycle': function (parser, token) {
        var parts = token.split_contents();

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
        var parts = token.split_contents();
        if (parts.length > 2) { throw 'unexpected syntax in "filter" tag'; }

        var expr = parser.make_filterexpression('|' + parts[1]);

        var node_list = parser.parse('endfilter');
        parser.delete_first_token();

        return nodes.FilterNode(expr, node_list);
    },

    'autoescape': inclusion_tag(nodes.AutoescapeNode, { argcount: 1, '1mustbe': ['on', 'off'] }),

    'block': inclusion_tag(nodes.BlockNode, { argcount: 1 }),

    'extends': simple_tag(nodes.ExtendsNode, { argcount: 1 }),

    'firstof': simple_tag(nodes.FirstOfNode),

    'with': inclusion_tag(nodes.WithNode, { argcount: 3, exclude: 2, '2mustbe': 'as' }),

    'now': simple_tag(nodes.NowNode, { argcount: 1 })
};

