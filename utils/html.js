/*jslint laxbreak: true, eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports */

var sys = require('sys');

/*  Function: escape(value);
        Escapes the characters &, <, >, ' and " in string with html entities.
    Arguments:
        value - string to escape
*/
var escape = exports.escape = function (value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&qout;');
};

/*  Function: linebreaks(value, options);
        Converts newlines into <p> and <br />s.
    Arguments:
        value - string, the string to convert.
        options - optional, see options
    Options:
        escape - boolean, if true pass the string through escape()
        onlybr - boolean, if true only br tags will be created.
*/
var linebreaks = exports.linebreaks = function (value, options) {
    options = options || {};
    value = value.replace(/\r\n|\r|\n/g, '\n');

    if (options.onlybr) {
        return (options.escape ? escape(value) : value).replace(/\n/g, '<br />');
    }

    var lines = value.split(/\n{2,}/);
    if (options.escape) {
        lines = lines.map( function (x) { return '<p>' + escape(x).replace('\n', '<br />') + '</p>'; } );
    } else {
        lines = lines.map( function (x) { return '<p>' + x.replace('\n', '<br />') + '</p>'; } );
    }
    return lines.join('\n\n');
};


var re_words = /&.*?;|<.*?>|(\w[\w\-]*)/g;
var re_tag = /<(\/)?([^ ]+?)(?: (\/)| .*?)?>/;
var html4_singlets = ['br', 'col', 'link', 'base', 'img', 'param', 'area', 'hr', 'input'];
var truncate_html_words = exports.truncate_html_words = function (input, cnt) {
    var words = 0, pos = 0, elipsis_pos = 0, length = cnt - 0;
    var open_tags = [];

    if (!length) { return ''; }

    re_words.lastIndex = 0;

    while (words <= length) {
        var m = re_words( input );
        if (!m) {
            // parsed through string
            break;
        }

        pos = re_words.lastIndex;

        if (m[1]) {
            // this is not a tag
            words += 1;
            if (words === length) {
                elipsis_pos = pos;
            }
            continue;
        }

        var tag = re_tag( m[0] );
        if (!tag || elipsis_pos) {
            // don't worry about non-tags or tags after truncate point
            continue;
        }

        var closing_tag = tag[1], tagname = tag[2].toLowerCase(), self_closing = tag[3];
        if (self_closing || html4_singlets.indexOf(tagname) > -1) {
            continue;
        } else if (closing_tag) {
            var idx = open_tags.indexOf(tagname);
            if (idx > -1) {
                // SGML: An end tag closes, back to the matching start tag, all unclosed intervening start tags with omitted end tags
                open_tags = open_tags.slice(idx + 1);
            }
        } else {
            open_tags.unshift( tagname );
        }
    }

    if (words <= length) {
        return input;
    }
    return open_tags.reduce( function (p,c) { return p + '</' + c + '>'; }, input.slice(0, elipsis_pos) + ' ...');
};



