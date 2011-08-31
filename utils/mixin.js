function mixin(to, from) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            to[key] = from[key];
        }
    }
}

exports.mixin = mixin;
