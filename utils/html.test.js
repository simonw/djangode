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
        assertEquals(expected_escaped, linebreaks(input, { autoescape: true }));
    })

run();
