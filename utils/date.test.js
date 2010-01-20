process.mixin(GLOBAL, require('utils/test').dsl);
process.mixin(GLOBAL, require('utils/date'));
var sys = require('sys');


testcase('date_format')
    test('should format each filter correctly', function () {
        var d = new Date(1981, 11, 2, 18, 31, 45, 123); // Random time on Britney Spears birthday :-)
        var tz = d.toString().substr(28, 5);
        assertEquals('p.m.', format_date(d, 'a'));
        assertEquals('PM', format_date(d, 'A'));
        assertEquals('dec', format_date(d, 'b'));
        shouldThrow(format_date, [d, 'B']);
        assertEquals('1981-12-02T18:31:45.123000', format_date(d, 'c'));
        assertEquals('02', format_date(d, 'd'));
        assertEquals('Wed', format_date(d, 'D'));
        assertEquals('6:31', format_date(d, 'f')); // x
        assertEquals('December', format_date(d, 'F'));
        assertEquals('6', format_date(d, 'g'));
        assertEquals('18', format_date(d, 'G'));  //x
        assertEquals('06', format_date(d, 'h'));
        assertEquals('18', format_date(d, 'H')); // x
        assertEquals('31', format_date(d, 'i')); // x
        shouldThrow(format_date, [d, 'I']);
        assertEquals('Wednesday', format_date(d, 'l'));
        assertEquals('false', format_date(d, 'L'));
        assertEquals('12', format_date(d, 'm')); // x
        assertEquals('Dec', format_date(d, 'M'));
        assertEquals('12', format_date(d, 'n'));
        assertEquals('Dec.', format_date(d, 'N'));
        assertEquals(tz, format_date(d, 'O'));

        assertEquals('6:31 p.m.', format_date(d, 'P'));
        assertEquals('midnight', format_date(new Date(2000, 1, 1, 0, 0), 'P'));
        assertEquals('noon', format_date(new Date(2000, 1, 1, 12, 0), 'P'));
        assertEquals('6 a.m.', format_date(new Date(2000, 1, 1, 6, 0), 'P'));

        assertEquals('Wed, 2 Dec 1981 18:31:45 ' + tz, format_date(d, 'r'));
        assertEquals('45', format_date(d, 's')); // x
        assertEquals('nd', format_date(d, 'S')); // x (st, nd, rt or th)

        assertEquals('31', format_date(d, 't'));
        assertEquals('30', format_date(new Date(2000, 10, 3), 't'));
        assertEquals('29', format_date(new Date(2000, 1, 3), 't'));
        assertEquals('28', format_date(new Date(1999, 1, 3), 't'));

        assertEquals('GMT+0100', format_date(d, 'T')); // good enough for now...
        assertEquals('376162305', format_date(d, 'U'));
        assertEquals('3', format_date(d, 'w'));
        assertEquals('49', format_date(d, 'W'));
        assertEquals('81', format_date(d, 'y'));
        assertEquals('1981', format_date(d, 'Y'));
        assertEquals('336', format_date(d, 'z'));
        assertEquals(tz * -36 + "", format_date(d, 'Z'));
    });

testcase('longer formats');
    test('l jS \\o\\f F Y h:i:s A', function () {
        var d = new Date(1981, 11, 2, 18, 31, 45, 123); // Random time on Britney Spears birthday :-)
        assertEquals('Wednesday 2nd of December 1981 06:31:45 PM', format_date(d, 'l jS \\o\\f F Y h:i:s A'));
    });

run();
