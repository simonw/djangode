djangode
========

Utility functions for node.js that imitate some useful concepts from Django.

    http://nodejs.org/
    http://www.djangoproject.com/

Example usage:

    var dj = require('./djangode');
    dj.serve(dj.makeApp([
        ['^/$', function(req, res) {
            dj.respond(res, '<h1>Homepage</h1>');
        }],
        ['^/other$', function(req, res) {
            dj.respond(res, '<h1>Other page</h1>');
        }],
        ['^/page/(\\d+)$', function(req, res, page) {
            dj.respond(res, '<h1>Page ' + page + '</h1>');
        }]
    ]), 8008); // Serves on port 8008

Run "node example.js" for a slightly more interesting example.
