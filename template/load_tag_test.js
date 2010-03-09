exports.filters = {
    testfilter: function () {
        return 'hestgiraf';
    }
};
exports.tags = {
    testtag: function () {
        return function (context, callback) {
            callback('', 'hestgiraf');
        };
    }
};

