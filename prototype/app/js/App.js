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
        document.querySelector('nav').addEventListener('click', this.onNavClick.bind(this));
        document.querySelector('input[name="inpFile"]').addEventListener('change', this.onInputFileChange.bind(this));
        document.getElementById('text').addEventListener('click', this.OnTextClick.bind(this));
        document.getElementById('winWordActions').addEventListener('click', this.OnWordActionClick.bind(this));

        this.DisplayStat();
        this.go2section('study');

        setTimeout(() => {
            Loadmask.hide();
        }, 1500);
    }
    static onNavClick(event){
        event.preventDefault();
        let href = event.target.getAttribute('href');
        if (href === null ){
            return;
        }
        this.go2section(href.substr(1))
    }
    static onInputFileChange(event){
        Loadmask.show('Загрузка файла...');
        Helper.IO.loadTextFromInputFile(event.srcElement, (isSuccess, text)=>{
            event.srcElement.value = '';
            if (!isSuccess){
                Loadmask.hide();
                return;
            }

            Loadmask.show('Конвертация книги...');
            let book = Fb2.getBookFromText(text);

            Loadmask.show('Формирование области чтения...');
            this.DisplayBook(book);


            this.go2section('read');
            Loadmask.hide();
        });
    }

    static go2section(sectionId) {
        Loadmask.show('Навигация...');
        setTimeout(() => {
            document.getElementById('content').querySelectorAll('section').forEach((elSection) => {
                elSection.classList.add('hidden');
            });
            document.getElementById(sectionId).classList.remove('hidden');
            document.getElementById(sectionId).scrollIntoView();
            Loadmask.hide();
        }, 50);
    }

    static DisplayBook(book) {
        let elText = document.getElementById('text');
        elText.innerHTML = '';
        /*
               let words = this.ExtractWords(this.debugText);
                console.log('words', words);
                words.forEach((word) => {
                    let newElWord = document.createElement('span');
                    newElWord.innerHTML = word;
                    let hash = this.getWordHash(word);
                    newElWord.classList.add('word');
                    newElWord.classList.add('word-hash-' + hash);
                    this.WordElMark(newElWord, this.WORD_STATE.WORD_STATE_UNKNOWN);

                    elText.appendChild(newElWord);
                });
        */
        book.sections.forEach((section) => {
            let containerTitle = document.createElement('h2');
            section.title.forEach((titleLine) => {
                let elLine = document.createElement('p');
                elLine.classList.add('text-title');
                let words = this.ExtractWords(titleLine);
                words.forEach((word) => {
                    let newElWord = document.createElement('span');
                    newElWord.innerHTML = word;
                    let hash = this.getWordHash(word);
                    newElWord.classList.add('word');
                    newElWord.classList.add('word-hash-' + hash);
                    this.WordElMark(newElWord, this.WORD_STATE.WORD_STATE_UNKNOWN);

                    elLine.appendChild(newElWord);
                });
                containerTitle.appendChild(elLine);
            });
            elText.appendChild(containerTitle);

            let containerSubtext = document.createElement('p');
            section.p.forEach((textLine) => {
                let elLine = document.createElement('p');
                elLine.classList.add('text-line');
                let words = this.ExtractWords(textLine);
                words.forEach((word) => {
                    let newElWord = document.createElement('span');
                    newElWord.innerHTML = word;
                    let hash = this.getWordHash(word);
                    newElWord.classList.add('word');
                    newElWord.classList.add('word-hash-' + hash);
                    this.WordElMark(newElWord, this.WORD_STATE.WORD_STATE_UNKNOWN);

                    elLine.appendChild(newElWord);
                });
                containerSubtext.appendChild(elLine);
            });
            elText.appendChild(containerSubtext);
        });
    }

    static ExtractWords(str) {
        let words = [];
        let word = '';
        let separatorsInclude = ',-';
        let separatorsExclude = ' ';
        let punctuation = '?!.';
        let isPrevAlphabette = true;
        for (let i = 0, len = str.length; i < len; i++) {
            let currChar = str[i];
            if (this.alphabette.indexOf(currChar) >= 0) {
                if(!isPrevAlphabette){
                    words.push(word);
                    word = '';
                    isPrevAlphabette = true;
                }
                word += currChar;
                continue;
            }
            if (word !== '') {
                if (isPrevAlphabette){
                    words.push(word);
                    word = '';
                }
            }
            if (punctuation.indexOf(currChar) >= 0) {
                if (word !== '') {
                    words.push(word);
                    word = '';
                }
                words.push(currChar);
                continue;
            }
            if (separatorsInclude.indexOf(currChar) >= 0) {
                if (word !== '') {
                    words.push(word);
                    word = '';
                }
                words.push(currChar);
                continue;
            }
            if (separatorsExclude.indexOf(currChar) >= 0) {
                if (word !== '') {
                    words.push(word);
                    word = '';
                }
                continue;
            }
            word += currChar;
            isPrevAlphabette = false;
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
        Loadmask.show('Загрузка перевода...');
        Helper.Google.translate('ru', e.target.innerHTML).then(function (result) {
            Loadmask.hide();
            console.log(e.target.innerHTML, result);
            elDialog.querySelector('.wa-translate').innerHTML = result.word;
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
        let result = Helper.hashCode(word.toLowerCase());
        return result;
    }
}