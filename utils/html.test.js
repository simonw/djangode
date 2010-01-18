process.mixin(GLOBAL, require('utils/test').dsl);
process.mixin(GLOBAL, require('utils/html'));

testcase('tests for linebreaks()')
    test('should break lines into <p> and <br /> tags', function () {
        var input = 'This is a \'nice\'\n'
            + 'way to spend the summer!\n'
            + '\n'
            + 'The days are just packed!\n';
        var expected = '<p>This is a \'nice\'<br />'
            + 'way to spend the summer!</p>\n'
            + '\n'
            + '<p>The days are just packed!<br /></p>';
        var expected_escaped = '<p>This is a &#39;nice&#39;<br />'
            + 'way to spend the summer!</p>\n'
            + '\n'
            + '<p>The days are just packed!<br /></p>';
        assertEquals(expected, linebreaks(input));
        assertEquals(expected_escaped, linebreaks(input, { escape: true }));
    })
testcase('truncate_html_words');
    test('should truncate strings without tags', function () {
        assertEquals('Joel is ...', truncate_html_words('Joel is a slug', 2));
    });
    test('should close tags on truncate', function () {
        assertEquals('<p>Joel is ...</p>', truncate_html_words('<p>Joel is a slug</p>', 2));
    });

run();
