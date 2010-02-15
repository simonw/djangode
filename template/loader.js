/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var sys = require('sys');
var posix = require('posix');

var cache = {};
var template_path = '/tmp';

function load(name, parse_function, callback) {
    if (cache[name] != undefined) {
        if (callback) {
            callback(cache[name]);
        } else {
            return cache[name];
        }
    } else {
        if (callback) {
            posix.cat(template_path + '/' + name).addCallback(function(s) {
                cache[name] = parse_function(s);
                callback(cache[name]);
            });
        } else {
            var content = posix.cat(template_path + '/' + name).wait();
            cache[name] = parse_function(content);
            return cache[name];
        }
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

