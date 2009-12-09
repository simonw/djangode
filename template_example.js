var posix = require('posix'),
    sys = require('sys'),
    dj = require('./djangode'),
    template = require('./template_system');

var test_context = {
    person_name: 'Thomas Hest',
    company: 'Tobis A/S',
    ship_date: '2. januar, 2010',
    item: 'XXX',
    item_list: [ 'Giraf', 'Fisk', 'Tapir'],
    ordered_warranty: true,
    ship: {
        name: 'M/S Martha',
        nationality: 'Danish',
    }
};

var app = dj.makeApp([
    ['^/raw$', function (req, res) {
        posix.cat("templates/template.html").addCallback( function (content) {
            dj.respond(res, content, 'text/plain');
        });
    }],
    ['^/tokens$', function (req, res) {
        posix.cat("templates/template.html").addCallback( function (content) {
            var t = template.tokenize(content);
            dj.respond(res, sys.inspect(t), 'text/plain');
        });
    }],
    ['^/parsed$', function (req, res) {
        posix.cat("templates/template.html").addCallback( function (content) {
            var t = template.parse(content);
            dj.respond(res, sys.inspect(t), 'text/plain');
        });
    }],
    ['^/rendered$', function (req, res) {
        posix.cat("templates/template.html").addCallback( function (content) {
            var t = template.parse(content);
            dj.respond(res, t.render(test_context), 'text/plain');
        });
    }],
]);

dj.serve(app, 8009);

