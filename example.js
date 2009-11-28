var dj = require('./djangode');

var app = dj.makeApp([
    ['^/$', function(req, res) {
        dj.respond(res, '<h1>djangode demo</h1> \
            <ul> \
                <li><a href="/delayed/1000">1 second delay page</a></li> \
                <li><a href="/error">Error page with stacktrace</a></li> \
                <li><a href="/404">Default 404</a></li> \
                <li><a href="/redirect">Redirect back to /</a></li> \
                <li><a href="/static-demo/hello.txt">Static hello.txt</a></li> \
            </ul> \
        ');
    }],
    ['^/delayed/(\\d+)$', function(req, res, howlong) {
        setTimeout(function() {
            dj.respond(res, 'I delayed for ' + howlong);
        }, parseInt(howlong, 10));
    }],
    ['^/error$', function(req, res) {
        "bob"("not a function"); // Demonstrates stacktrace page
    }],
    ['^/redirect$', function(req, res) {
        dj.redirect(res, '/');
    }],
    ['^/favicon\.ico$', function(req, res) {
        dj.respond(res, 'Nothing to see here');
    }],
    ['^/(static-demo/.*)$', dj.serveFile] // Serve files from static-demo/
]);

dj.serve(app, 8009);
