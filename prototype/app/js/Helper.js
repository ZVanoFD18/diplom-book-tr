Helper = {};
Helper.Base62 = {
    chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    encode: function (n) {
        var s = '';
        do {
            s = this.chars[n % 62] + s;
        }
        while (n = Math.floor(n / 62));
        return s;
    },
    decode: function (s) {
        var q = s.length,
            w,
            e = 0,
            r = 0;
        while (q--) {
            if (w = this.chars.indexOf(s[q])) {
                r += w * Math.pow(62, e);
            }
            ++e;
        }
        return r;
    }
};
/**
 * Возвращает простой хеш строки.
 * @param str
 * @returns {number}
 */
Helper.hashCode = function (str) {
    var hash = 0;
    if (str.length == 0) {
        return hash;
    }
    for (var i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    hash = Math.abs(hash);
    hash = hash.toString(16);
    return hash;
};
