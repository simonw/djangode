/*jslint laxbreak: true, eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports */

var sys = require('sys');

/* Function: smart_split(s)
 *      Split a string by spaces, leaving qouted phrases together. Supports both
 *      single and double qoutes, and supports escaping strings qoutes with
 *      backslashes. Qoutemarks wil not be removed.
 *
 *  Returns:
 *      Array of strings.
 */
function smart_split(s) {
    // regular expression from django/utils/text.py in Django project.
    var re = /([^\s"]*"(?:[^"\\]*(?:\\.[^"\\]*)*)"\S*|[^\s']*'(?:[^'\\]*(?:\\.[^'\\]*)*)'\S*|\S+)/g,
        out = [],
        m = false;

    while (m = re.exec(s)) {
        out.push(m[0]);
    }
    return out;
}
exports.smart_split = smart_split;

/* Function: add_slashes
 *      Escapes qoutes in string by adding backslashes in front of them.
 */
function add_slashes(s) {
    return s.replace(/['"]/g, "\\$&"); 
}
exports.add_slashes = add_slashes;

/* Function: cap_first
 *      Capitalizes first letter of string
 */
function cap_first(s) {
    return s[0].toUpperCase() + s.substring(1); 
}
exports.cap_first = cap_first;

function center(s, width) {
    if (s.length > width) { return s; }
    var right = Math.round((width - s.length) / 2);
    var left = width - (s.length + right);
    return (new Array(left + 1)).join(' ') + s + (new Array(right + 1)).join(' ');
}
exports.center = center;

function html_escape(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&qout;');
};
exports.html_escape = html_escape;



