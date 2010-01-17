/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var sys = require('sys');
var posix = require('posix');
var template = require('template/template');

var cache = {};
var template_path = '.';

function load(name) {
    if (!cache[name]) {
        var content = posix.cat(template_path + '/' + name).wait();
        cache[name] = template.parse(content);
    }
    return cache[name];
}

function flush() {
    cache = {};
}

function set_path(path) {
    template_path = path;
}

exports.load = load;
exports.set_path = set_path;
exports.flush = flush;

