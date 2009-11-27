var http = require('http'),
    sys = require('sys'),
    posix = require('posix');

function extname(path) {
    var index = path.lastIndexOf('.');
    return index < 0 ? '' : path.substring(index);
}

exports.serveFile = function(req, res, filename) {
    // TODO: Ensure security against directory traversal attacks
    var body, headers;
    var content_type = mime.lookup(extname(filename));
    var encoding = (content_type.slice(0,4) === 'text' ? 'utf8' : 'binary');
    var status = 200;
    
    function loadResponseData(callback) {
        if (body && headers) {
            callback();
            return;
        }
        sys.puts("loading " + filename + "...");
        var promise = posix.cat(filename, encoding);
        promise.addCallback(function(data) {
            body = data;
            headers = [
                ['Content-Type', content_type],
                ['Content-Length', body.length]
            ];
            sys.puts("static file " + filename + " loaded");
            callback();
        });
        promise.addErrback(function() {
            status = 404;
            body = '404'
            sys.puts("Error loading " + filename);
            callback();
        });
    }
    loadResponseData(function() {
        res.sendHeader(status, headers);
        res.sendBody(body, encoding);
        res.finish();
    });
}

exports.serve = function(app, port) {
    sys.puts('Server on http://127.0.0.1:' + port + '/');
    return http.createServer(app).listen(port);
}

function respond(res, body, content_type, status) {
    content_type = content_type || 'text/html';
    res.sendHeader(status || 200, {
        'Content-Type': content_type  + '; charset=utf-8'
    });
    res.sendBody(body);
    res.finish();
}
exports.respond = respond;

exports.redirect = redirect = function(res, location, status) {
    status = status || 301;
    res.sendHeader(status || 200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Location': location
    });
    res.sendBody('Redirecting...');
    res.finish();
}

exports.extractPost = function(req, callback) {
    req.setBodyEncoding('utf-8');
    var body = '';
    req.addListener('body', function(chunk) {
        body += chunk;
    });
    req.addListener('complete', function() {
        callback(http.parseUri('http://fake/?' + body).params);
    });
}

var debuginfo = {}
exports.debuginfo = debuginfo;

exports.makeApp = function(urls, options) {
    // Compile the regular expressions
    var compiled = urls.map(function(pair) {
        return [new RegExp(pair[0]), pair[1]];
    });
    options = options || {};
    var show_404 = (options.show_404 || default_show_404);
    var show_500 = (options.show_500 || default_show_500);
    return function(req, res) {
        debuginfo.last_request = req;
        debuginfo.last_response = res;
        var path = req.uri.path;
        var view = show_404;
        var args = [req, res];
        for (var pair, i = 0; pair = compiled[i]; i++) {
            //sys.puts("Matching " + pair[0] + " against path " + path);
            var match = pair[0](path);
            if (match) {
                //sys.puts("  matched! " + match);
                // Add matched bits to args
                match.slice(1).forEach(function(arg) {
                    args.push(arg);
                });
                view = pair[1];
                break;
            }
        }
        try {
            view.apply(null, args);
        } catch (e) {
            debuginfo.last_e = e;
            show_500(req, res, e);
        }
    }
}

function default_show_404(req, res) {
    respond(res,
        '<h1>404</h1>', 'text/html', 404
    );
}
exports.default_show_404 = default_show_404

function default_show_500(req, res, e) {
    var msg = ''
    if ('stack' in e && 'type' in e) {
        msg = (
            '<p><strong>' + e.type + '</strong></p><pre>' + 
            e.stack + '</pre>'
        );
    } else {
        msg = JSON.stringify(e, 0, 2);
    }
    respond(res, '<h1>500</h1>' + msg, 'text/html', 500);
}
exports.default_show_500 = default_show_500

exports.mime = mime = {
    lookup : function(ext, fallback) {
        return mime.types[ext.toLowerCase()] || fallback || mime.default_type;
    },
    default_type: 'application/octet-stream',
    types: {
        ".3gp"   : "video/3gpp",
        ".a"     : "application/octet-stream",
        ".ai"    : "application/postscript",
        ".aif"   : "audio/x-aiff",
        ".aiff"  : "audio/x-aiff",
        ".asc"   : "application/pgp-signature",
        ".asf"   : "video/x-ms-asf",
        ".asm"   : "text/x-asm",
        ".asx"   : "video/x-ms-asf",
        ".atom"  : "application/atom+xml",
        ".au"    : "audio/basic",
        ".avi"   : "video/x-msvideo",
        ".bat"   : "application/x-msdownload",
        ".bin"   : "application/octet-stream",
        ".bmp"   : "image/bmp",
        ".bz2"   : "application/x-bzip2",
        ".c"     : "text/x-c",
        ".cab"   : "application/vnd.ms-cab-compressed",
        ".cc"    : "text/x-c",
        ".chm"   : "application/vnd.ms-htmlhelp",
        ".class" : "application/octet-stream",
        ".com"   : "application/x-msdownload",
        ".conf"  : "text/plain",
        ".cpp"   : "text/x-c",
        ".crt"   : "application/x-x509-ca-cert",
        ".css"   : "text/css",
        ".csv"   : "text/csv",
        ".cxx"   : "text/x-c",
        ".deb"   : "application/x-debian-package",
        ".der"   : "application/x-x509-ca-cert",
        ".diff"  : "text/x-diff",
        ".djv"   : "image/vnd.djvu",
        ".djvu"  : "image/vnd.djvu",
        ".dll"   : "application/x-msdownload",
        ".dmg"   : "application/octet-stream",
        ".doc"   : "application/msword",
        ".dot"   : "application/msword",
        ".dtd"   : "application/xml-dtd",
        ".dvi"   : "application/x-dvi",
        ".ear"   : "application/java-archive",
        ".eml"   : "message/rfc822",
        ".eps"   : "application/postscript",
        ".exe"   : "application/x-msdownload",
        ".f"     : "text/x-fortran",
        ".f77"   : "text/x-fortran",
        ".f90"   : "text/x-fortran",
        ".flv"   : "video/x-flv",
        ".for"   : "text/x-fortran",
        ".gem"   : "application/octet-stream",
        ".gemspec": "text/x-script.ruby",
        ".gif"   : "image/gif",
        ".gz"    : "application/x-gzip",
        ".h"     : "text/x-c",
        ".hh"    : "text/x-c",
        ".htm"   : "text/html",
        ".html"  : "text/html",
        ".ico"   : "image/vnd.microsoft.icon",
        ".ics"   : "text/calendar",
        ".ifb"   : "text/calendar",
        ".iso"   : "application/octet-stream",
        ".jar"   : "application/java-archive",
        ".java"  : "text/x-java-source",
        ".jnlp"  : "application/x-java-jnlp-file",
        ".jpeg"  : "image/jpeg",
        ".jpg"   : "image/jpeg",
        ".js"    : "application/javascript",
        ".json"  : "application/json",
        ".log"   : "text/plain",
        ".m3u"   : "audio/x-mpegurl",
        ".m4v"   : "video/mp4",
        ".man"   : "text/troff",
        ".mathml"  : "application/mathml+xml",
        ".mbox"  : "application/mbox",
        ".mdoc"  : "text/troff",
        ".me"    : "text/troff",
        ".mid"   : "audio/midi",
        ".midi"  : "audio/midi",
        ".mime"  : "message/rfc822",
        ".mml"   : "application/mathml+xml",
        ".mng"   : "video/x-mng",
        ".mov"   : "video/quicktime",
        ".mp3"   : "audio/mpeg",
        ".mp4"   : "video/mp4",
        ".mp4v"  : "video/mp4",
        ".mpeg"  : "video/mpeg",
        ".mpg"   : "video/mpeg",
        ".ms"    : "text/troff",
        ".msi"   : "application/x-msdownload",
        ".odp"   : "application/vnd.oasis.opendocument.presentation",
        ".ods"   : "application/vnd.oasis.opendocument.spreadsheet",
        ".odt"   : "application/vnd.oasis.opendocument.text",
        ".ogg"   : "application/ogg",
        ".p"     : "text/x-pascal",
        ".pas"   : "text/x-pascal",
        ".pbm"   : "image/x-portable-bitmap",
        ".pdf"   : "application/pdf",
        ".pem"   : "application/x-x509-ca-cert",
        ".pgm"   : "image/x-portable-graymap",
        ".pgp"   : "application/pgp-encrypted",
        ".pkg"   : "application/octet-stream",
        ".pl"    : "text/x-script.perl",
        ".pm"    : "text/x-script.perl-module",
        ".png"   : "image/png",
        ".pnm"   : "image/x-portable-anymap",
        ".ppm"   : "image/x-portable-pixmap",
        ".pps"   : "application/vnd.ms-powerpoint",
        ".ppt"   : "application/vnd.ms-powerpoint",
        ".ps"    : "application/postscript",
        ".psd"   : "image/vnd.adobe.photoshop",
        ".py"    : "text/x-script.python",
        ".qt"    : "video/quicktime",
        ".ra"    : "audio/x-pn-realaudio",
        ".rake"  : "text/x-script.ruby",
        ".ram"   : "audio/x-pn-realaudio",
        ".rar"   : "application/x-rar-compressed",
        ".rb"    : "text/x-script.ruby",
        ".rdf"   : "application/rdf+xml",
        ".roff"  : "text/troff",
        ".rpm"   : "application/x-redhat-package-manager",
        ".rss"   : "application/rss+xml",
        ".rtf"   : "application/rtf",
        ".ru"    : "text/x-script.ruby",
        ".s"     : "text/x-asm",
        ".sgm"   : "text/sgml",
        ".sgml"  : "text/sgml",
        ".sh"    : "application/x-sh",
        ".sig"   : "application/pgp-signature",
        ".snd"   : "audio/basic",
        ".so"    : "application/octet-stream",
        ".svg"   : "image/svg+xml",
        ".svgz"  : "image/svg+xml",
        ".swf"   : "application/x-shockwave-flash",
        ".t"     : "text/troff",
        ".tar"   : "application/x-tar",
        ".tbz"   : "application/x-bzip-compressed-tar",
        ".tcl"   : "application/x-tcl",
        ".tex"   : "application/x-tex",
        ".texi"  : "application/x-texinfo",
        ".texinfo" : "application/x-texinfo",
        ".text"  : "text/plain",
        ".tif"   : "image/tiff",
        ".tiff"  : "image/tiff",
        ".torrent" : "application/x-bittorrent",
        ".tr"    : "text/troff",
        ".txt"   : "text/plain",
        ".vcf"   : "text/x-vcard",
        ".vcs"   : "text/x-vcalendar",
        ".vrml"  : "model/vrml",
        ".war"   : "application/java-archive",
        ".wav"   : "audio/x-wav",
        ".wma"   : "audio/x-ms-wma",
        ".wmv"   : "video/x-ms-wmv",
        ".wmx"   : "video/x-ms-wmx",
        ".wrl"   : "model/vrml",
        ".wsdl"  : "application/wsdl+xml",
        ".xbm"   : "image/x-xbitmap",
        ".xhtml"   : "application/xhtml+xml",
        ".xls"   : "application/vnd.ms-excel",
        ".xml"   : "application/xml",
        ".xpm"   : "image/x-xpixmap",
        ".xsl"   : "application/xml",
        ".xslt"  : "application/xslt+xml",
        ".yaml"  : "text/yaml",
        ".yml"   : "text/yaml",
        ".zip"   : "application/zip"
    }
};
