
var sys = require('sys'),
    template_defaults = require('./template_defaults');


/***************** TOKENIZER ******************************/

function tokenize(input) {
    var re = /(?:{{|}}|{%|%})|[{}|]|[^{}%|]+/g;
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
        var res = consume_until("}}"),
            token = { type: 'variable', contents: [] },
            parts = res[0].trim().split(/\s*\|\s*/);

        token.contents.push(parts.shift());

        parts.forEach( function (filter) {
            token.contents.push( filter.split(/\s*:\s*/) );
        });

        token_list.push( token );

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

function split_token(input) {
    var re = /([^\s"]*"(?:[^"\\]*(?:\\.[^"\\]*)*)"\S*|[^\s']*'(?:[^'\\]*(?:\\.[^'\\]*)*)'\S*|\S+)/g,
        out = [],
        m = false;

    while (m = re.exec(input)) {
        out.push(m[0]);
    }
    return out;
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
    },

});

function evaluate_node_list (node_list, context) {
    return node_list.reduce( function (p, c) { return p + c(context); }, '');
}

/*************** Context *********************************/

function Context(o) {
    this.scope = [ o ];
}

process.mixin(Context.prototype, {
    get: function (name) {

        if (name === 'true') { return true; }
        if (name === 'false') { return false; }
        if (/\d/.exec(name[0])) { return Number(name); }

        var isStringLiteral = /^(["'])(.*?)\1$/.exec(name);
        if (isStringLiteral) { return isStringLiteral.pop(); }

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


/*********** Template **********************************/

function Template(node_list) {
    this.node_list = node_list;
}

process.mixin(Template.prototype, {
    render: function (o) {
        context = new Context(o);
        return evaluate_node_list(this.node_list, context);
    }
});

/********************************************************/

exports.parse = function (input) {
    var parser = new Parser(input);
    return new Template(parser.parse());
}
exports.split_token = split_token;
exports.evaluate_node_list = evaluate_node_list; 

// exported for test
exports.Context = Context;
exports.tokenize = tokenize;


