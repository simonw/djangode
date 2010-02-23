/*jslint eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports, escape */

var sys = require('sys');
var fs = require('fs');

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
            fs.readfile(template_path + '/' + name, function (error, s) {
                if (error) { callback(error); }
                cache[name] = parse_function(s);
                callback(false, cache[name]);
            });
        } else {
            var content = fs.readFileSync(template_path + '/' + name);
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

