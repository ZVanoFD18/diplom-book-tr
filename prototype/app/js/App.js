'use strict';
console.log('App');

let App = {
	LANGUAGES: {
		RUS: 'RUS',
		ENG: 'ENG'
	},

	GOOGLE_LANGUAGES: {
		RUS: 'ru',
		ENG: 'en'
	},

	WORD_STATE: {
		WORD_STATE_STUDY: 'WORD_STATE_STUDY',
		WORD_STATE_STUDYED: 'WORD_STATE_STUDYES',
		WORD_STATE_UNKNOWN: 'WORD_STATE_UNKNOWN'
	},

	langGui: undefined,
	langStudy: undefined,
	/**
	 * private {Object} book
	 */
	book: {},

	run() {
		this.langGui = this.LANGUAGES.RUS;
		this.langStudy = this.LANGUAGES.ENG;
		// this.langGui = this.LANGUAGES.ENG;
		// this.langStudy = this.LANGUAGES.RUS;


		document.querySelector('nav').addEventListener('click', this.onNavClick.bind(this));
		document.querySelector('input[name="inpFile"]').addEventListener('change', this.onInputFileChange.bind(this));
		document.getElementById('text').addEventListener('click', this.onTextClick.bind(this));
		document.getElementById('winWordActions').addEventListener('click', this.onWordActionClick.bind(this));
		App.Component.Study.init(document.getElementById('study'));

		App.Component.Loadmask.show('Загрузка...');
		this.Idb.getLastBook().then((lastBook) => {
			this.displayStat();
			if (Helper.isDefined(lastBook)){
				this.bookToRead(lastBook.content, false);
			} else {
				this.go2section('study');
			}
		}).catch((e) => {
			Helper.Log.addDebug(e)
			this.go2section('library');
		});
		this.displayStat();
	},

	onNavClick(event) {
		event.preventDefault();
		let href = event.target.getAttribute('href');
		if (href === null) {
			return;
		}
		this.go2section(href.substr(1))
	},

	onInputFileChange(event) {
		App.Component.Loadmask.show('Загрузка файла...');
		Helper.Io.loadTextFromInputFile(event.srcElement, (isSuccess, text) => {
			event.srcElement.value = '';
			if (!isSuccess) {
				App.Component.Loadmask.hide();
				return;
			}
			this.bookToRead(text, true)
		});
	},
	bookToRead(text, isAdd) {
		isAdd = isAdd || true;
		App.Component.Loadmask.show('Конвертация книги...');
		let book = App.Fb2.getBookFromText(text);
		console.log(book);

		App.Component.Loadmask.show('Формирование области чтения...');
		this.displayBook(book).then(() => {
			this.go2section('read');
			App.Component.Loadmask.hide();
			if (isAdd) {
				App.Idb.Books.add(this.langStudy, book.title.join('/'), book.image, text).then((result) => {
					console.log('Книга добавлена в локальную библиотеку');
					App.Idb.KeyVal.LastSession.put(result.book.hash, 0).then(() => {
						console.log('Книга добавлена в сессию');
					});
				}).catch((e) => {
					Helper.Log.addDebug(e);
					alert('Ошибка! Не удалось добавить книгу в БД.');
				});
			}
		});
	},

	go2section(sectionId) {
		App.Component.Loadmask.show('Навигация...');
		setTimeout(() => {
			document.getElementById('content').querySelectorAll('section').forEach((elSection) => {
				elSection.classList.add('hidden');
			});
			document.getElementById(sectionId).classList.remove('hidden');
			document.getElementById(sectionId).scrollIntoView();
			App.Component.Loadmask.hide();
			switch (sectionId) {
				case 'study' :
					this.Component.Study.display();
					break;
			}
		}, 50);
	},

	displayBook(book) {
		return new Promise((resolve, reject) => {
			let elText = document.getElementById('text');
			let wordsStudy = {};
			App.Idb.WordsStudy.getAllAsObject(this.langStudy).then((resWords) => {
				wordsStudy = resWords;
				parseBook();
			}).catch(() => {
				parseBook();
			});

			let parseBook = () => {
				elText.innerHTML = '';
				book.sections.forEach((section) => {
					let containerTitle = document.createElement('h2');
					section.title.forEach((titleLine) => {
						let elLine = document.createElement('p');
						elLine.classList.add('text-title');
						let words = App.Words.getWords(this.langStudy, titleLine);
						words.forEach((word) => {
							let newElWord = document.createElement('span');
							newElWord.innerHTML = word;
							let hash = this.getWordHash(word);
							newElWord.classList.add('word');
							newElWord.classList.add('word-hash-' + hash);
							let normalizedWord = App.Idb.getNormalizedWord(word);
							if (normalizedWord in wordsStudy) {
								if (wordsStudy[normalizedWord].isStudy) {
									this.wordElMark(newElWord, this.WORD_STATE.WORD_STATE_STUDY);
								} else {
									this.wordElMark(newElWord, this.WORD_STATE.WORD_STATE_STUDYED);
								}
							} else {
								this.wordElMark(newElWord, this.WORD_STATE.WORD_STATE_UNKNOWN);
							}
							elLine.appendChild(newElWord);
						});
						containerTitle.appendChild(elLine);
					});
					elText.appendChild(containerTitle);

					let containerSubtext = document.createElement('p');
					section.p.forEach((textLine) => {
						let elLine = document.createElement('p');
						elLine.classList.add('text-line');
						let words = App.Words.getWords(this.langStudy, textLine);
						words.forEach((word) => {
							let newElWord = document.createElement('span');
							newElWord.innerHTML = word;
							let hash = this.getWordHash(word);
							newElWord.classList.add('word');
							newElWord.classList.add('word-hash-' + hash);
							let normalizedWord = App.Idb.getNormalizedWord(word);
							if (normalizedWord in wordsStudy) {
								if (wordsStudy[normalizedWord].isStudy) {
									this.wordElMark(newElWord, this.WORD_STATE.WORD_STATE_STUDY);
								} else {
									this.wordElMark(newElWord, this.WORD_STATE.WORD_STATE_STUDYED);
								}
							} else {
								this.wordElMark(newElWord, this.WORD_STATE.WORD_STATE_UNKNOWN);
							}

							elLine.appendChild(newElWord);
						});
						containerSubtext.appendChild(elLine);
					});
					elText.appendChild(containerSubtext);
				});
				resolve();
			}
		});
	},

	/**
	 *
	 * @param {DomEvent} e
	 * @constructor
	 */
	onTextClick(e) {
		let elDialog = document.getElementById('winWordActions');
		if (!e.target.classList.contains('word')) {
			elDialog.classList.add('wa-hidden');
			return;
		}
		elDialog.querySelector('.wa-word').innerHTML = e.target.innerHTML;
		elDialog.querySelector('.wa-translate').innerHTML = '...';
		elDialog.classList.remove('wa-hidden');
		App.Component.Loadmask.show('Загрузка перевода...');
		this.getTranslate(e.target.innerHTML).then((translate) => {
			App.Component.Loadmask.hide();
			elDialog.querySelector('.wa-translate').innerHTML = translate;
		}).catch((e) => {
			elDialog.querySelector('.wa-translate').innerHTML = '???';
			Helper.Log.addDebug(e);
			elDialog.classList.add('wa-hidden');
			App.Component.WinMsg.show({
				title: 'Ошибка!',
				message: e instanceof Error ? e.message : 'Не удалось получить перевод слова'
			});
			App.Component.Loadmask.hide();
		})

	},
	getTranslate(word, isReturnStruct = false) {
		return new Promise((resolve, reject) => {
			App.Idb.WordsTranslate.get(this.langStudy, this.langGui, word).then((translateStruct) => {
				if (Helper.isObject(translateStruct)) {
					if (isReturnStruct) {
						resolve(translateStruct);
					} else {
						resolve(translateStruct.translate);
					}
				} else {
					Helper.Google.translate(this.GOOGLE_LANGUAGES[this.langGui], word).then((result) => {
						console.log(word, result);
						if (!Helper.isObject(result)) {
							reject();
							return;
						}
						let struct = Helper.Google.getTranslateConverted(result);
						if (Helper.isEmpty(struct.translate)) {
							reject(new Error('Не удалось получить перевод от Google'))
						} else {
							if (!isReturnStruct) {
								resolve(struct.translate);
							}
							;
							App.Idb.WordsTranslate.put(this.langStudy, this.langGui, word, struct.translate, struct.score)
								.then(() => {
									return App.Idb.WordsTranslate.get(this.langStudy, this.langGui, word);
								})
								.then((translateStruct) => {
									if (isReturnStruct) {
										if (Helper.isObject(translateStruct)) {
											resolve(translateStruct);
										} else {
											reject(new Error('Неудалось извлечь слово из БД после сохранения'));
										}
									}
								});
						}
					});
				}
			});
		});
	},
	/**
	 *
	 * @param {Array} words
	 */
	getTranslates(words) {
		let result = [];
		return Promise.all((() => {
			let promices = [];
			words.forEach((word) => {
				promices.push(this.getTranslate(word, true))
			});
			return promices;
		})()).then((results) => {
			if (!Helper.isArray(results)){
				return new Error('Не удалось получить перевод для списка слов');
			}
			return results;
		});
	},

	onWordActionClick(e) {
		let word = undefined,
			elWord = undefined;
		if (e.target.classList.contains('wa-btn-studied')) {
			document.getElementById('winWordActions').classList.add('wa-hidden');
			word = e.target.closest('#winWordActions').querySelector('.wa-word').innerHTML;
			this.WordStudyedAdd(word);
			this.wordsMark(word, this.WORD_STATE.WORD_STATE_STUDYED);
		} else if (e.target.classList.contains('wa-btn-study')) {
			document.getElementById('winWordActions').classList.add('wa-hidden');
			word = e.target.closest('#winWordActions').querySelector('.wa-word').innerHTML;
			this.wordStudyAdd(word);
			this.wordsMark(word, this.WORD_STATE.WORD_STATE_STUDY);
		}
	},

	wordsMark(word, state) {
		let classWordHash = 'word-hash-' + this.getWordHash(word);
		let words = document.getElementById('text').querySelectorAll('.' + classWordHash);
		words.forEach((elWord) => {
			this.wordElMark(elWord, state);
		});
	},

	wordElMark(elWord, state) {
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
	},

	wordStudyAdd(word) {
		App.Idb.WordsStudy.put(this.langStudy, word, {
			isStudy: App.Idb.TRUE
		}).then((rowId) => {
			console.log('wordStudyAdd1', rowId);
			this.displayStat();
		}).catch((e) => {
			console.log('wordStudyAdd1  /false', e);
		});
	},

	WordStudyedAdd(word) {
		App.Idb.WordsStudy.put(this.langStudy, word, {
			isStudy: App.Idb.FALSE
		}).then((isSuccess) => {
			console.log('wordStudyAdd2', isSuccess);
			this.displayStat();
		}).catch((e) => {
			console.log('wordStudyAdd2/false', e);
		});
	},

	displayStat() {
		App.Idb.WordsStudy.getStat(this.langStudy).then((stat) => {
			document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = stat.cntStudy;
			document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = stat.cntStudied;
		}).catch((e) => {
			Helper.Log.addDebug('Непредвиденная ошибка при получении статистики изучения слов');
			document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = '???';
			document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = '???';
		})
	},

	getWordHash(word) {
		let result = Helper.Hash.hashCode(word.toLowerCase());
		return result;
	}
};