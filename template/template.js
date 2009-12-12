/*jslint laxbreak: true, eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports */
var sys = require('sys');
var utils = require('../utils/utils');
var template_defaults = require('./template_defaults');

/***************** TOKENIZER ******************************/

function tokenize(input) {
    var re = /(?:\{\{|\}\}|\{%|%\})|[\{\}|]|[^\{\}%|]+/g;
    var token_list = [];

    function consume(re, input) {
        var m = re.exec(input);
        return m ? m[0] : null;
    }

    function consume_until() {
        var next, s = '';
        while (next = consume(re, input)) {
            if (Array.prototype.slice.apply(arguments).indexOf(next) > -1) {
                return [s, next];
            }
            s += next;
        }
        return [s];
    }

    function literal() {
        var res = consume_until("{{", "{%");

        if (res[0]) { token_list.push( {type: 'text', contents: res[0] } ); }
        
        if (res[1] === "{{") { return variable_tag; }
        if (res[1] === "{%") { return template_tag; }
        return undefined;
    }

    function variable_tag() {
        var res = consume_until("}}");

        if (res[0]) { token_list.push( {type: 'variable', contents: res[0].trim() } ); }

        if (res[1]) { return literal; }
        return undefined;
    }

    function template_tag() {
        var res = consume_until("%}"),
            parts = res[0].trim().split(/\s/, 1);

        token_list.push( { type: parts[0], contents: res[0].trim() });

        if (res[1]) { return literal; }
        return undefined;
    }

    var state = literal;

    while (state) {
        state = state();
    }

    return token_list;
}


/*********** PARSER **********************************/

function parser_error(e) {
    return 'Parsing exception: ' + JSON.stringify(e, 0, 2);
}

function Parser(input) {
    this.token_list = tokenize(input);
    this.indent = 0;
}

process.mixin(Parser.prototype, {

    callbacks: template_defaults.callbacks,

    parse: function () {
    
        var stoppers = Array.prototype.slice.apply(arguments);
        var node_list = [];
        var token = this.token_list[0];
        var callback = null;

        //sys.debug('' + this.indent++ + ':starting parsing with stoppers ' + stoppers.join(', '));

        while (this.token_list.length) {
            if (stoppers.indexOf(this.token_list[0].type) > -1) {
                //sys.debug('' + this.indent-- + ':parse done returning at ' + token[0] + ' (length: ' + node_list.length + ')');
                return node_list;
            }

            token = this.next_token();

            //sys.debug('' + this.indent + ': ' + token);

            callback = this.callbacks[token.type];
            if (callback && typeof callback === 'function') {
                node_list.push( callback.call(null, this, token) );
            } else {
                //throw parser_error('Unknown tag: ' + token[0]);
                node_list.push( template_defaults.TextNode('[[ UNKNOWN ' + token.type + ' ]]'));
            }
        }
        if (stoppers.length) {
            throw new parser_error('Tag not found: ' + stoppers.join(', '));
        }

        //sys.debug('' + this.indent-- + ':parse done returning end (length: ' + node_list.length + ')');

        return node_list;
    },

    next_token: function () {
        return this.token_list.shift();
    },

    delete_first_token: function () {
        this.token_list.shift();
    }

});

function normalize(value) {
    if (typeof value !== 'string') { return value; }

    if (value === 'true') { return true; }
    if (value === 'false') { return false; }
    if (/^\d/.exec(value)) { return Number(value); }

    var isStringLiteral = /^(["'])(.*?)\1$/.exec(value);
    if (isStringLiteral) { return isStringLiteral.pop(); }

    return value;
}

/*************** Context *********************************/

function Context(o) {
    this.scope = [ o ];
}

process.mixin(Context.prototype, {
    get: function (name) {

        var normalized = normalize(name);
        if (name !== normalized) { return normalized; }

        var parts = name.split('.');
        name = parts.shift();

        var val, level, next;
        for (level = 0; level < this.scope.length; level++) {
            if (this.scope[level].hasOwnProperty(name)) {
                val = this.scope[level][name];
                while (parts.length && val) {
                    next = val[parts.shift()];
                    if (typeof next === 'function') {
                        val = next.apply(val);
                    } else {
                        val = next;
                    }
                }

                return val;
            }
        }

        return '';
    },
    set: function (name, value) {
        this.scope[0][name] = value;
    },
    push: function (o) {
        this.scope.unshift(o || {});
    },
    pop: function () {
        return this.scope.shift();
    }
});

/*********** FilterExpression **************************/

var FilterExpression = function (expression, constant) {

    // groups 1 = variable/constant, 2 = arg name, 3 = arg value without qoutes
    this.re = /(^"[^"\\]*(?:\\.[^"\\]*)*"|^[\w\.]+)?(?:\|(\w+\b)(?::"([^"\\]*(?:\\.[^"\\]*)*)")?)?(?=\S|$)/g;
    this.re.lastIndex = 0;

    var parsed = this.consume(expression);
    if (!parsed) {
        throw this.error(expression + ' - 1');
    }
    if (constant) {
        if (parsed.variable) {
            throw this.error(expression + ' - 2'); // did not expect variable when constant is defined...
        } else {
            this.constant = constant;
        }
    } else {
        if (parsed.variable) {
            if (parsed.variable !== normalize(parsed.variable)) {
                // if normalize changed the variable it must be some form of constant
                this.constant = normalize(parsed.variable);
            } else {
                this.variable = parsed.variable;
            }
        } else {
            throw this.error(expression + ' - 3');
        }
    }

    this.filter_list = [];

    while (parsed && parsed.filter_name) {
        this.filter_list.push( { name: parsed.filter_name, arg: normalize(parsed.filter_arg) } );
        parsed = this.consume(expression);
    }

    if (expression.length !== this.re.lastIndex) {
        throw this.error(expression + ' - 4');
    }
};

process.mixin(FilterExpression.prototype, {

    consume: function (expression) {
        var start = this.re.lastIndex;
        var m = this.re.exec(expression);

        return m[0] ? { variable: m[1], filter_name: m[2], filter_arg: m[3] } : null;
    },

    error: function (s) {
        throw s + "\ncan't parse filterexception at char " + this.re.lastIndex + ". Make sure there is no spaces between filters or arguments\n";
    },

    resolve: function (context) {
        var value;
        if (this.hasOwnProperty('constant')) {
            value = this.constant;
        } else {
            value = context.get(this.variable);
        }

        return this.filter_list.reduce( function (p,c) {
            var filter = template_defaults.filters[c.name];
            if ( filter && typeof filter === 'function') {
                return filter(p, c.arg);
            } else {
                // throw 'Cannot find filter';
                sys.debug('Cannot find filter ' + c.name);
                return value;
            }
        }, value);
    }
});

exports.FilterExpression = FilterExpression;


/*********** Template **********************************/

function Template(node_list) {
    this.node_list = node_list;
}

process.mixin(Template.prototype, {
    render: function (o) {
        var context = new Context(o);
        try {
            return evaluate_node_list(this.node_list, context);
        } catch (e) {
            sys.debug(e);
            return e;
        }
    }
});

/********************************************************/

exports.parse = function (input) {
    var parser = new Parser(input);
    // TODO: Better error handling, this is lame
    try {
        return new Template(parser.parse());
    } catch (e) {
        return new Template([ template_defaults.nodes.TextNode(e) ]);
    }
};

// TODO: Make this a property on a token class
function split_token(input) {
    return utils.string.smart_split(input);
}
exports.split_token = split_token;


// TODO: Node lists are always created by the Parser class, so it could extend the list with this method.
function evaluate_node_list (node_list, context) {
    return node_list.reduce( function (p, c) { return p + c(context); }, '');
}
exports.evaluate_node_list = evaluate_node_list; 


// exported for test
exports.Context = Context;
exports.tokenize = tokenize;


