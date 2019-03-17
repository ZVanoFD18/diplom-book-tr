'use strict';

class App {
    static debugText = 'В траве сидел кузнечик. He has green color!'.repeat(10);
    static alphabette = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890\'';
    // static alphabette = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ1234567890\'';
    /**
     * private {Object} book
     */
    static book = {};
    static wordsStudy = {};
    static wordsStudied = {};
    static WORD_STATE = {
        WORD_STATE_STUDY: 'WORD_STATE_STUDY',
        WORD_STATE_STUDYED: 'WORD_STATE_STUDYES',
        WORD_STATE_UNKNOWN: 'WORD_STATE_UNKNOWN'
    };

    static run() {
        document.querySelector('input[name="inpFile"]').addEventListener('change', (event) => {
            let files = event.srcElement.files;
            var reader = new FileReader();
            reader.onload = (e) => {
                document.querySelector('pre.fb2').innerText = e.target.result;
            };
            reader.readAsText(files[0]);
        });
        document.querySelector('button.convert').addEventListener('click', (event) => {
            let x2js = new X2JS();
            let json = x2js.xml_str2json(document.querySelector('pre.fb2').innerText);
            console.log('json', json);
            this.book = json;
            document.querySelector('pre.json').innerText = JSON.stringify(json);
        });
        document.getElementById('btnJsonToConsole').addEventListener('click', (event) => {
            this.JsonToConsole();
        });
        document.getElementById('btnDisplayBook').addEventListener('click', (event) => {
            this.DisplayBook();
        });
        document.getElementById('text').addEventListener('click', this.OnTextClick.bind(this));
        document.getElementById('winWordActions').addEventListener('click', this.OnWordActionClick.bind(this));
        this.DisplayStat();
    }

    static JsonToConsole() {
        console.log('book', this.book);
    }

    static DisplayBook() {
        let words = this.ExtractWords(this.debugText);
        console.log('words', words);
        let elText = document.getElementById('text');
        elText.innerHTML = '';
        words.forEach((word) => {
            let newElWord = document.createElement('span');
            newElWord.innerHTML = word;
            let hash = this.getWordHash(word);
            newElWord.classList.add('word');
            newElWord.classList.add('word-hash-' + hash);
            this.WordElMark(newElWord, this.WORD_STATE.WORD_STATE_UNKNOWN);

            elText.appendChild(newElWord);
        });
    }

    static ExtractWords(str) {
        let words = [];
        let word = '';
        let separators = ' ,';
        let punctuation = '?!.';
        for (let i = 0, len = str.length; i < len; i++) {
            if (this.alphabette.indexOf(str[i]) >= 0) {
                word += str[i];
                continue;
            }
            if (word !== '') {
                words.push(word);
                word = '';
            }
            if (punctuation.indexOf(str[i]) >= 0) {
                words.push(str[i]);
            }
        }
        if (word !== '') {
            words.push(word);
        }
        return words;
    }

    /**
     *
     * @param {DomEvent} e
     * @constructor
     */
    static OnTextClick(e) {
        let elDialog = document.getElementById('winWordActions');
        if (!e.target.classList.contains('word')) {
            elDialog.classList.add('wa-hidden');
            return;
        }
        elDialog.querySelector('.wa-word').innerHTML = e.target.innerHTML;
        elDialog.querySelector('.wa-translate').innerHTML = '...';
        elDialog.classList.remove('wa-hidden');
        this.getTranslate({
            word: e.target.innerHTML,
            success() {
                alert('success');
            }
        });
    }

    static OnWordActionClick(e) {
        let word = undefined,
            elWord = undefined;
        if (e.target.classList.contains('wa-btn-studied')) {
            document.getElementById('winWordActions').classList.add('wa-hidden');
            word = e.target.closest('#winWordActions').querySelector('.wa-word').innerHTML;
            this.WordStudyedAdd(word);
            this.WordsMark(word, this.WORD_STATE.WORD_STATE_STUDYED);
        } else if (e.target.classList.contains('wa-btn-study')) {
            document.getElementById('winWordActions').classList.add('wa-hidden');
            word = e.target.closest('#winWordActions').querySelector('.wa-word').innerHTML;
            this.WordStudyAdd(word);
            this.WordsMark(word, this.WORD_STATE.WORD_STATE_STUDY);
        }
    }

    static WordsMark(word, state) {
        let classWordHash = 'word-hash-' + this.getWordHash(word);
        let words = document.getElementById('text').querySelectorAll('.' + classWordHash);
        words.forEach((elWord) => {
            this.WordElMark(elWord, state);
        });
    }

    static WordElMark(elWord, state) {
        elWord.classList.remove('word-unknown');
        elWord.classList.remove('word-study');
        elWord.classList.remove('word-studied');
        switch (state) {
            case this.WORD_STATE.WORD_STATE_STUDY:
                elWord.classList.add('word-study');
                break;
            case this.WORD_STATE.WORD_STATE_STUDYED:
                elWord.classList.add('word-studied');
                break;
            case this.WORD_STATE.WORD_STATE_UNKNOWN:
                elWord.classList.add('word-unknown');
                break;
        }
    }

    static WordStudyAdd(word) {
        this.wordsStudy[word] = true;
        delete this.wordsStudied[word];
        this.DisplayStat();
    }

    static WordStudyedAdd(word) {
        this.wordsStudied[word] = true;
        delete this.wordsStudy[word];
        this.DisplayStat();
    }

    static DisplayStat() {
        document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = Object.keys(this.wordsStudy).length;
        document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = Object.keys(this.wordsStudied).length;
    }

    static getWordHash(word) {
        let result = Helper.hashCode(word);
        return result;
    }

    static getTranslate(options) {
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
        xhr.upload.onload = ()=>{
            alert('aaa')
        };
        xhr.addEventListener('readystatechange', function() {
            if (xhr.readyState !== 4) {
                return;
            }
            console.log('readystatechange4 arguments',arguments);
            var header = xhr.getResponseHeader('Content-Disposition');
            let type = xhr.getResponseHeader('Content-Type');
            // debugger;
            alert('@TODO: Как читать ответ, который приходит в заголовке <content-disposition: attachment; filename="f.txt">')
            xhr.upload.onload = ()=>{
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
    }
}