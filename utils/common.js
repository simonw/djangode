function extend(a,b){
    var prop;
    for(prop in b) 
        if (Object.prototype.hasOwnProperty.call(b,prop)) 
            a[prop] = b[prop];
    return a;
} 

exports.extend = extend;