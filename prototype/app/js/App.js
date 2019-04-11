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
		document.querySelector('.nav-icon').addEventListener('click', this.onNavIconClick.bind(this));
		document.querySelector('nav.nav').addEventListener('click', this.onNavClick.bind(this));

		document.querySelector('input[name="inpFile"]').addEventListener('change', this.onInputFileChange.bind(this));
		App.Component.Read.init();
		App.Component.Study.init(document.getElementById('study'));

		App.Component.Loadmask.show('Загрузка...');
		this.Idb.getLastBook().then((lastBook) => {
			App.Component.Statistic.display();
			if (Helper.isDefined(lastBook)){
				this.bookToRead(lastBook.content, false);
			} else {
				this.go2section('study');
			}
		}).catch((e) => {
			Helper.Log.addDebug(e);
			this.go2section('library');
		});
		App.Component.Statistic.display();
	},
	onNavIconClick (event){
		let elNav = document.querySelector('.nav');
		elNav.classList.toggle('hidden')
		// if(elNav.classList.contains('hidden')){
		// }
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
		isAdd = Helper.isDefined(isAdd) ? isAdd : true;
		App.Component.Loadmask.show('Конвертация книги...');
		let book = Helper.Fb2.getBookFromText(text);
		console.log(book);

		App.Component.Loadmask.show('Формирование области чтения...');
		App.Component.Read.displayBook(book).then(() => {
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

	wordStudyAdd(word) {
		App.Idb.WordsStudy.put(this.langStudy, word, {
			isStudy: App.Idb.TRUE
		}).then((rowId) => {
			console.log('wordStudyAdd1', rowId);
			App.Component.Statistic.display();
		}).catch((e) => {
			console.log('wordStudyAdd1/false', e);
		});
	},

	WordStudyedAdd(word) {
		App.Idb.WordsStudy.put(this.langStudy, word, {
			isStudy: App.Idb.FALSE
		}).then((isSuccess) => {
			console.log('wordStudyAdd2', isSuccess);
			App.Component.Statistic.display();
		}).catch((e) => {
			console.log('wordStudyAdd2/false', e);
		});
	},

	getWordHash(word) {
		let result = Helper.Hash.hashCode(word.toLowerCase());
		return result;
	}
};