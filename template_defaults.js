var sys = require('sys');
var template = require('./template_system');


exports.callbacks = {
    'text': function (parser, token) { return TextNode(token.contents); },

    'variable': function (parser, token) {
        // TODO: use split_token here
        return VariableNode(token.contents[0], token.contents.slice(1));
    },

    'for': function (parser, token) {
        
        var parts = template.split_token(token.contents);

        if (parts[0] !== 'for' || parts[2] !== 'in' || (parts[4] && parts[4] !== 'reversed')) {
            throw 'unexpected syntax in "for" tag' + sys.inspect(parts);
        }
        
        var itemname = parts[1],
            listname = parts[3],
            isReversed = (parts[4] === 'reversed'),
            node_list = parser.parse('endfor');

        parser.delete_first_token();

        return ForNode(itemname, listname, node_list, isReversed);
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
                expect_item = true;
            }
        }

        var node_list, else_list = [];
        
        node_list = parser.parse('else', 'endif');
        if (parser.next_token().type === 'else') {
            else_list = parser.parse('endif');
        }

        parser.delete_first_token();

        return IfNode(item_names, not_item_names, operator, node_list, else_list);
    }
};

function TextNode(text) {
    return function () { return text; }
}
exports.TextNode = TextNode;


function VariableNode(name, filters) {

    // TODO: Filters
    return function (context) { return context.get(name); }
}
exports.VariableNode = VariableNode;


function ForNode(itemname, listname, node_list, isReversed) {

    return function (context) {
        var forloop = { parentloop: context.get('forloop') },
            list = context.get(listname),
            out = '';


        if (! list instanceof Array) { return TextNode(''); }
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
                last: idx === iter.length - 1,
            });
            context.set(itemname, o);

            out += template.evaluate_node_list( node_list, context );
        });

        context.pop();

        return out;
    };
}
exports.ForNode = ForNode;

function IfNode(item_names, not_item_names, operator, if_node_list, else_node_list) {

    return function (context) {

        function not(x) { return !x; }
        function and(p,c) { return p && c; }
        function or(p,c) { return p || c; }

        var items = item_names.map( context.get, context ).concat(
            not_item_names.map( context.get, context ).map( not )
        );

        var isTrue = items.reduce( operator === 'and' ? and : or, true );

        if (isTrue) {
            return template.evaluate_node_list( if_node_list, context );
        } else if (else_node_list.length) {
            return template.evaluate_node_list( else_node_list, context );
        } else {
            return '';
        }
    };
}
exports.IfNode = IfNode;

