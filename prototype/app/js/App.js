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
	appEnv : undefined,
	langGui: undefined,
	langStudy: undefined,
	/**
	 * private {Object} book
	 */
	book: {},

	run() {
		// this.langGui = this.LANGUAGES.RUS;
		// this.langStudy = this.LANGUAGES.ENG;
		this.langGui = this.LANGUAGES.ENG;
		this.langStudy = this.LANGUAGES.RUS;

		// Отключаем выделение мышью (чтобы не выделялся текст меню при двойном клике).
		document.body.onmousedown = () => {
			return false
		};
		document.body.onselectstart = () => {
			return false
		};

		App.Component.Nav.init();
		App.Component.Setlang.init();
		App.Component.Library.init();
		App.Component.Read.init();
		App.Component.Study.init();
		App.Component.Loadmask.show('...');
		this.loadEnv().then(()=>{
			App.localizeGui();
			App.Component.Loadmask.show(App.localize('Загрузка...'));
			this.Idb.getLastBook().then((lastBook) => {
				App.Component.Statistic.display();
				if (Helper.isDefined(lastBook)) {
					this.bookToRead(lastBook.content, false);
				} else {
					App.Component.Nav.go2section('setlang');
				}
			}).catch((e) => {
				Helper.Log.addDebug(e);
				App.Component.Nav.go2section('library');
			});
			App.Component.Statistic.display();
		}).catch((e)=>{
			App.Component.WinMsg.show({
				title:App.localize('Уведомление.'),
				message:App.localize('Не удалось инициализировать приложение.')
			});
		});
	},
	loadEnv(){
		return new Promise((resolve, reject)=>{
			/**
			 *
			 * @type {XMLHttpRequest}
			 */
			let xhr = Helper.Ajax.getXhr();
			xhr.open('GET', '/resources/app-env.json');
			xhr.send();
			xhr.addEventListener('readystatechange', () => {
				if (xhr.readyState !== 4) {
					return;
				}
				let json = JSON.parse(xhr.responseText);
				this.appEnv = json;
				resolve();
			});
		});
	},
	bookToReadByHash(hash) {
		App.Component.Loadmask.show(App.localize('Извлечение книги...'));
		let book;
		return new Promise((resolve, reject) => {
			this.Idb.Books.getByHash(hash).then((resBook) => {
				book = resBook;
				//App.Component.Loadmask.hide();
				return this.bookToRead(resBook.content, false);
			}).then(() => {
				return App.Idb.KeyVal.LastSession.put(book.hash, 0).then(() => {
					console.log('Книга добавлена в сессию');
				});
			}).catch((e) => {
				reject(new App.Errors.User('Книга не найдена в библиотеке'));
			});
		});
	},

	bookToRead(text, isAdd) {
		return new Promise((resolve, reject) => {
			isAdd = Helper.isDefined(isAdd) ? isAdd : true;
			App.Component.Loadmask.show(App.localize('Конвертация книги...'));
			let book = Helper.Fb2.getBookFromText(text);
			console.log(book);

			App.Component.Loadmask.show(App.localize('Формирование области чтения...'));
			App.Component.Read.displayBook(book).then(() => {
				App.Component.Nav.go2section('read');
				App.Component.Loadmask.hide();
				if (!isAdd) {
					resolve();
				} else {
					App.Idb.Books.add(
						this.langStudy,
						book.title.join('/'),
						book.image,
						text
					).then((result) => {
						console.log('Книга добавлена в локальную библиотеку');
						App.Idb.KeyVal.LastSession.put(result.book.hash, 0).then(() => {
							console.log('Книга добавлена в сессию');
							resolve();
						});
					}).catch((e) => {
						Helper.Log.addDebug(e);
						alert('Ошибка! Не удалось добавить книгу в БД.');
						reject();
					});
				}
			});
		});
	},
	/**
	 * Фозвращает Promise перевода одного слова.
	 * @param word {String}
	 * @param isReturnStruct {Boolean}
	 * @return {Promise<any>}
	 */
	getWordTranslate(word, isReturnStruct = false) {
		return new Promise((resolve, reject) => {
			App.Idb.WordsTranslate.get(
				this.langStudy,
				this.langGui,
				word
			).then((translateStruct) => {
				if (Helper.isObject(translateStruct)) {
					if (isReturnStruct) {
						resolve(translateStruct);
					} else {
						resolve(translateStruct.translate);
					}
				} else {
					Helper.Google.translate(
						this.GOOGLE_LANGUAGES[this.langGui],
						word
					).then((result) => {
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
							App.Idb.WordsTranslate.put(
								this.langStudy,
								this.langGui,
								word,
								struct.translate,
								struct.score
							).then(() => {
								return App.Idb.WordsTranslate.get(this.langStudy, this.langGui, word);
							}).then((translateStruct) => {
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
	 * Возвращает Promise перевода массива слов.
	 * @param {Array} words
	 */
	getWordsTranslate(words) {
		let result = [];
		return Promise.all((() => {
			let promices = [];
			words.forEach((word) => {
				promices.push(this.getWordTranslate(word, true))
			});
			return promices;
		})()).then((results) => {
			if (!Helper.isArray(results)) {
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
	},
	/**
	 *
	 * @param text
	 * @return {*}
	 */
	localize(text) {
		return App.Localize.get(text, App.langGui)
	},
	localizeGui() {
		let elList = document.querySelectorAll('.need-translate');
		elList.forEach((elTranslate) => {
			elTranslate.innerHTML = App.Localize.get(elTranslate.innerHTML, App.langGui);
		})
	}
};