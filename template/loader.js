/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var sys = require('sys');
var fs = require('fs');

var cache = {};
var template_path = '/tmp';

function load(name, parse_function, callback) {
    if (!callback) { throw 'loader.load() must be called with a callback'; }

    if (cache[name] != undefined) {
        callback(false, cache[name]);
    } else {
        fs.readFile(template_path + '/' + name, function (error, s) {
            if (error) { callback(error); }
            cache[name] = parse_function(s);
            callback(false, cache[name]);
        });
    }
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

