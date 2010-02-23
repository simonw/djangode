var sys = require('sys');

exports.reduce = function reduce(array, iter_callback, initial, result_callback) {

    var index = 0;
    var depth = 0;

    (function inner (error, value) {

        if (error) {
            result_callback(error);
        }
        
        if (index < array.length) {
            process.nextTick( function () {
                try {
                    iter_callback( value, array[index++], inner );
                } catch (e) {
                    result_callback(e);
                }
            });
        } else {
            result_callback( false, value );
        }
    })( false, initial );
}

