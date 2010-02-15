var sys = require('sys');
process.mixin(GLOBAL, require('utils/test').dsl);
process.mixin(GLOBAL, require('utils/string'));

testcase('string utility functions');
    test('smart_split should split correctly', function () {
        assertEquals(['this', 'is', '"the \\"correct\\" way"'], smart_split('this is "the \\"correct\\" way"'));
    });
    test('add_slashes should add slashes', function () {
        assertEquals('this is \\"it\\"', add_slashes('this is "it"'));
    });
    test('cap_first should capitalize first letter', function () {
        assertEquals('Yeah baby!', cap_first('yeah baby!'));
    });
    test('center should center text', function () {
        assertEquals('     centered     ', center('centered', 18));
        assertEquals('     centere      ', center('centere', 18));
        assertEquals('    centered     ', center('centered', 17));
        assertEquals('centered', center('centered', 3));
    });
testcase('titleCaps')
    test('should work as expected', function () {
        assertEquals("Nothing to Be Afraid Of?", titleCaps("Nothing to Be Afraid of?"));
        assertEquals("Q&A With Steve Jobs: 'That's What Happens in Technology'",
            titleCaps("Q&A With Steve Jobs: 'That's What Happens In Technology'")
        );
    })

run();
