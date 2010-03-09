var sys = require('sys'),
    dj = require('./djangode'),
    template_system = require('./template/template');
    template_loader = require('./template/loader');

// set template path
template_loader.set_path('template-demo');

// context to use when rendering template. In a real app this would likely come from a database
var test_context = {
    person_name: 'Thomas Hest',
    company: 'Tobis A/S',
    ship_date: new Date('12-02-1981'),
    item: 'XXX',
    item_list: [ 'Giraf', 'Fisk', 'Tapir'],
    ordered_warranty: true,
    ship: {
        name: 'M/S Martha',
        nationality: 'Danish'
    }
};


// make app
var app = dj.makeApp([
    ['^/$', function(req, res) {
        dj.respond(res, '<h1>djangode template demo</h1> \
            <ul> \
                <li><a href="/template">The raw template</a></li> \
                <li><a href="/context">The test context</a></li> \
                <li><a href="/text">The template rendered as text</a></li> \
                <li><a href="/html">The template rendered as html</a></li> \
            </ul> \
        ');
    }],

    ['^/template$', function (req, res) {
        dj.serveFile(req, res, 'template-demo/template.html');
    }],

    ['^/context$', function (req, res) {
        dj.respond(res, sys.inspect(test_context), 'text/plain');
    }],

    ['^/text$', function (req, res) {
        template_loader.load_and_render('template.html', test_context, function (error, result) {
            if (error) {
                dj.default_show_500(req, res, error);
            } else {
                dj.respond(res, result, 'text/plain');
            }
        });
    }],

    ['^/html$', function (req, res) {
        template_loader.load_and_render('template.html', test_context, function (error, result) {
            if (error) {
                dj.default_show_500(req, res, error);
            } else {
                dj.respond(res, result, 'text/plain');
            }
        });
    }],

    ['^/(template-demo/.*)$', dj.serveFile],

]);

dj.serve(app, 8009);
process.djangode_urls = app.urls;

