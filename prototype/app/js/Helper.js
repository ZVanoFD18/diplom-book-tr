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

Helper.Google = {};
Helper.Google.translate = function (translateTo, text, translateFrom = 'auto') {
    return new Promise((resolve, reject) => {
        const url = "https://translate.googleapis.com/translate_a/single?"
            + "client=gtx"
            + "&sl=" + translateFrom
            + "&tl=" + translateTo
            + "&dt=t"
            + "&q=" + encodeURI(text);

        fetch(url).then(response => {
            response.json().then(data => {
                resolve({
                    word: data[0][0][0],
                    data: data
                })
            }, reject)
        }, reject)
    });
};

Helper.Google.translateXhr = function (options) {
    if (typeof(options) !== 'object') {
        throw new Error('options - не объект');
    }
    let xhr = new XMLHttpRequest();
    // single?client=gtx&sl=auto&dt=t&dt=bd&dj=1&text={{some%20tex}}t&tl=ru
    let formData = new FormData();
    formData.append('client', 'gtx');
    formData.append('sl', 'auto');
    formData.append('dt', 't');
    formData.append('dt', 'bd');
    formData.append('dj', '1');
    formData.append('tl', 'ru');
    formData.append('text', options.word);
    let url = 'https://translate.googleapis.com/translate_a/single';
    let urlGet = url + '?';
    for (var pair of formData.entries()) {
        //console.log(pair[0]+ ', '+ pair[1]);
        urlGet += ((urlGet.substr(-1, 1) === '?' ? '' : '&') + encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]));
    }
    xhr.open('GET', urlGet);
    //xhr.responseType = 'arraybuffer';
    xhr.withCredentials = true;
    xhr.setRequestHeader('Destination', url);
    xhr.setRequestHeader("Access-Control-Allow-Headers", "*");
    // xhr.setRequestHeader("Origin", "http://localhost");
    //xhr.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    xhr.send(formData);
    xhr.upload.onload = () => {
        alert('aaa')
    };
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState !== 4) {
            return;
        }
        console.log('readystatechange4 arguments', arguments);
        var header = xhr.getResponseHeader('Content-Disposition');
        let type = xhr.getResponseHeader('Content-Type');
        // debugger;
        alert('@TODO: Как читать ответ, который приходит в заголовке <content-disposition: attachment; filename="f.txt">')
        xhr.upload.onload = () => {
            alert('aaa')
        };
        //let json = JSON.parse(xhr.responseText);
        //console.log('google result', json);
    });
    // xhr.onload = function () {
    //     var header = xhr.getResponseHeader('Content-Disposition');
    //     var startIndex = header.indexOf("filename=") + 10; // Adjust '+ 10' if filename is not the right one.
    //     var endIndex = contentDisposition.length - 1; //Check if '- 1' is necessary
    //     var filename = contentDisposition.substring(startIndex, endIndex);
    //     console.log("filename: " + filename)
    // }
};

Helper.Xml = {};
Helper.Xml.transformXslt = function (source, style) {
    if (window.ActiveXObject) {
        return source.transformNode(style);
    } else if (window.XSLTProcessor) {
        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(style);
        var resultDocument = xsltProcessor.transformToDocument(source);
        var xmls = new XMLSerializer();
        return xmls.serializeToString(resultDocument);
    } else {
        alert("XML-transform not supported");
        return null;
    }
};

Helper.Xml.getXMLFromString = function (s) {
    if (window.ActiveXObject) {
        var xml;
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = false;
        xml.loadXML(s);
        return xml;
    }
    else if (window.DOMParser) {
        var parser = new DOMParser();
        return parser.parseFromString(s, 'text/xml');
    } else {
        alert("XML load not supported");
        return null;
    }
};