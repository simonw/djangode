/*jslint laxbreak: true, eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports */

var sys = require('sys');

var escape = exports.escape = function (value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&qout;');
}

/*  Function: linebreaks(value, options);
        Converts newlines into <p> and <br />s.
    Arguments:
        value - string, the string to convert.
        options - optional, see options
    Options:
        autoescape - boolean, if true pass the string through escape()
*/
var linebreaks = exports.linebreaks = function (value, options) {
    options = options || {};
    value = value.replace(/\r\n|\r|\n/g, '\n');
    var lines = value.split(/\n{2,}/);
    if (options.autoescape) {
        lines = lines.map( function (x) { return '<p>' + escape(x).replace('\n', '<br />') + '</p>'; } );
    } else {
        lines = lines.map( function (x) { return '<p>' + x.replace('\n', '<br />') + '</p>'; } );
    }
    return lines.join('\n\n');
}

