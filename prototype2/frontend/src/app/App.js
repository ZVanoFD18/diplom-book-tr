'use strict';

import './App.css';

import Helper from './Helper';
import Component from './App/Component';
import Errors from './App/Errors';
import Idb from './App/Idb';
import Localize from './App/Localize';
import ErrorUser from './App/Errors/User';

const stat = {
	WORD_STATE: {
		WORD_STATE_STUDY: 'WORD_STATE_STUDY',
		WORD_STATE_STUDYED: 'WORD_STATE_STUDYES',
		WORD_STATE_UNKNOWN: 'WORD_STATE_UNKNOWN'
	},
	/**
	 * Перечень тегов, для которых разрешено выделение мышью
	 */
	selectibleTags: ['SELECT', 'INPUT'],

	/**
	 * @see: {data/app-env.json}
	 */
	appEnv: undefined,

	langGui: undefined,
	langStudy: undefined,

	/**
	 * private {Object} book
	 */
	book: {}
};


export default class App {
	/**-----------------------------------------------------------------------
	 * Внешние библиотеки
	 */

	static get Helper() {
		return Helper;
	}

	static get Component() {
		return Component;
	}

	static get Errors() {
		return Errors;
	}

	static get Idb() {
		return Idb;
	}

	static get Localize() {
		return Localize;
	}

	/**-----------------------------------------------------------------------
	 * Внутренняя реализация
	 */
	static get WORD_STATE() {
		return stat.WORD_STATE
	}

	static get appEnv() {
		return stat.appEnv;
	}

	//
	// static set appEnv(newValue) {
	// 	stat.appEnv = newValue;
	// }

	static run() {
		// Отключаем выделение мышью (чтобы не выделялся текст меню при двойном клике).
		document.body.onmousedown = (event) => {
			if (stat.selectibleTags.indexOf(event.target.tagName) >= 0) {
				return true
			}
			return false
		};
		document.body.onselectstart = () => {
			if (stat.selectibleTags.indexOf(event.target.tagName) >= 0) {
				return true
			}
			return false
		};
		Component.init();

		// Пока локализация не установлена.
		App.Component.Loadmask.show('...');
		(new Promise((resolve, reject) => {
			// Старт. Читаем с сервера конфиг окружения.
			App.loadEnv().then(() => {
				resolve();
			}).catch((e) => {
				reject(e);
			});
		})).then(() => {
			// Раздел чтения последней сессии пользователя из БД
			let data = {
				lastSession: undefined,
				lastBook: undefined,
				isBookReaded: false
			};
			return new Promise((resolve, reject) => {
				App.Idb.KeyVal.LastSession.get().then((lastSession) => {
					data.lastSession = lastSession;
					resolve(data);
				});
			});
		}).then((data) => {
			// Раздел локализации приложения
			return new Promise((resolve, reject) => {
				if (Helper.isObject(data.lastSession)) {
					App.langGui = data.lastSession.langGui;
					App.langStudy = data.lastSession.langStudy;
				} else {
					App.langGui = stat.appEnv.defaults.langGui;
					App.langStudy = stat.appEnv.defaults.langStudy;
				}
				App.localizeGui();
				resolve(data);
			});
		}).then((data) => {
			// Раздел чтения книги из последней сессии пользователя
			return new Promise((resolve, reject) => {
				App.Component.Loadmask.show(App.localize('Загрузка...'));
				App.Component.Statistic.display().then(() => {
					if (Helper.isObject(data.lastSession) && Helper.isString(data.lastSession.bookHash)) {
						App.Idb.Books.getByHash(data.lastSession.bookHash).then((lastBook) => {
							data.lastBook = lastBook;
							resolve(data);
						}).catch(() => {
							resolve(data);
						});
					} else {
						resolve(data);
					}
				}).catch((e) => {
					Helper.Log.addDebug('Не удалось обновить статистику изучения слов');
					resolve(data);
				});
			});
		}).then((data) => {
			// Раздел вывода книги в область чтения
			return new Promise((resolve, reject) => {
				if (data.lastBook && data.lastBook.content) {
					App.bookToRead(data.lastBook.content, false).then(() => {
						data.isBookReaded = true;
						resolve(data);
					}).catch((e) => {
						reject(e);
					});
				} else {
					resolve(data);
				}
			});
		}).then((data) => {
			// Раздел принятия решения о навигации в зависимости от результата инициализации.
			App.Component.Loadmask.hide();
			if (data.isBookReaded) {
				App.Component.Nav.go2section('read');
				//App.Component.Nav.go2section('study');
			} else if (data.lastSession) {
				App.Component.Nav.go2section('library');
			} else {
				App.Component.Nav.go2section('setlang');
			}
		}).catch((e) => {
			Helper.Log.addDebug(e);
			if (e instanceof ErrorUser) {
				App.Component.WinMsg.show({
					title: App.localize('Уведомление.'),
					message: e.message,
					callback: () => {
						App.Component.Nav.go2section('setlang');
					}
				});
			} else {
				App.Component.Nav.go2section('setlang');
			}
		});
	}

	/**
	 * Загружает переменные окружения для приложения (справочник языков, языки по умолчанию и т.д.).
	 * @return {Promise<any>}
	 */
	static loadEnv() {
		return new Promise((resolve, reject) => {
			/**
			 *
			 * @type {XMLHttpRequest}
			 */
			let xhr = Helper.Ajax.getXhr();
			xhr.open('GET', '/data/app-env.json');
			xhr.send();
			xhr.addEventListener('readystatechange', () => {
				if (xhr.readyState !== 4) {
					return;
				}
				let json = JSON.parse(xhr.responseText);
				stat.appEnv = json;
				resolve();
			});
		});
	}

	/**
	 * Находит по хешу книгу в библиотеке и переправляет ее в секцию чтения.
	 * @param hash
	 * @return {Promise<any>}
	 */
	static bookToReadByHash(hash) {
		App.Component.Loadmask.show(App.localize('Извлечение книги...'));
		let book;
		return new Promise((resolve, reject) => {
			App.Idb.Books.getByHash(hash).then((resBook) => {
				book = resBook;
				return App.bookToRead(resBook.content, false);
			}).then(() => {
				return App.Idb.KeyVal.LastSession.put({
					langGui: App.langGui,
					langStudy: App.langStudy,
					bookHash: book.hash,
					bookPosition: 0
				}).then(() => {
					App.Component.Loadmask.hide();
					resolve()
				});
			}).catch((e) => {
				reject(e);
			});
		});
	}

	/**
	 * Загрузить текст книги в область чтения.
	 * @param text
	 * @param isAdd
	 * @return {Promise<any>}
	 */
	static bookToRead(text, isAdd) {
		return new Promise((resolve, reject) => {
			isAdd = Helper.isDefined(isAdd) ? isAdd : true;
			App.Component.Loadmask.show(App.localize('Конвертация книги...'));
			let book;
			try {
				book = Helper.Fb2.getBookFromText(text);
			} catch (e) {
				Helper.Log.addDebug(e);
				reject(new App.Errors.User(App.localize('Не удалось преобразовать книгу')));
			}
			if (App.langStudy !== stat.appEnv.fb2.languages[book.lang]) {
				App.Component.Loadmask.hide();
				reject(new ErrorUser(App.localize('Язык книги не соответствует изучаемому.')));
				return;
			}
			App.Component.Loadmask.show(App.localize('Формирование области чтения...'));
			App.Component.Read.displayBook(book).then(() => {
				App.Component.Loadmask.hide();
				if (!isAdd) {
					resolve();
				} else {
					App.Idb.Books.add(
						App.langStudy,
						book.title.join('/'),
						book.image,
						text
					).then((result) => {
						App.Idb.KeyVal.LastSession.put({
							bookHash: result.hash,
							bookPosition: 0
						}).then(() => {
							resolve();
						});
					}).catch((e) => {
						App.Component.Loadmask.hide();
						Helper.Log.addDebug(e);
						App.Component.WinMsg.show({
							title: '<span style="color: red">' + App.localize('Ошибка!') + '</span>',
							message: App.localize('Не удалось добавить книгу в библиотеку.')
						});
						reject();
					});
				}
			}).catch((e) => {
				App.Component.Loadmask.hide();
				reject(e);
			});
		});
	}

	/**
	 * Фозвращает Promise перевода одного слова.
	 * @param word {String}
	 * @param isReturnStruct {Boolean}
	 * @return {Promise<any>}
	 */
	static getWordTranslate(word, isReturnStruct = false) {
		return new Promise((resolve, reject) => {
			App.Idb.WordsTranslate.get(
				App.langStudy,
				App.langGui,
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
						stat.appEnv.google.languages[App.langGui],
						word
					).then((result) => {
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
								App.langStudy,
								App.langGui,
								word,
								struct.translate,
								struct.score
							).then(() => {
								return App.Idb.WordsTranslate.get(App.langStudy, App.langGui, word);
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
	}

	/**
	 * Возвращает Promise перевода массива слов.
	 * @param {Array} words
	 */
	static getWordsTranslate(words) {
		let result = [];
		return Promise.all((() => {
			let promices = [];
			words.forEach((word) => {
				promices.push(App.getWordTranslate(word, true))
			});
			return promices;
		})()).then((results) => {
			if (!Helper.isArray(results)) {
				return new Error('Не удалось получить перевод для списка слов');
			}
			return results;
		});
	}

	static wordStudyAdd(word) {
		App.Idb.WordsStudy.put(App.langStudy, word, {
			isStudy: App.Idb.TRUE
		}).then((rowId) => {
			App.Component.Statistic.display();
		}).catch((e) => {
			Helper.Log.addDebug(e);
		});
	}

	static WordStudyedAdd(word) {
		App.Idb.WordsStudy.put(App.langStudy, word, {
			isStudy: App.Idb.FALSE
		}).then((isSuccess) => {
			App.Component.Statistic.display();
		}).catch((e) => {
			Helper.Log.addDebug(e);
		});
	}

	static getWordHash(word) {
		let result = Helper.Hash.hashCode(word.toLowerCase());
		return result;
	}

	/**
	 *
	 * @param text
	 * @return {*}
	 */
	static localize(text) {
		return App.Localize.get(text, App.langGui)
	}

	static localizeGui() {
		let elList = document.querySelectorAll('.need-translate');
		elList = [].slice.call(elList)
		elList.forEach((elTranslate) => {
			let key = elTranslate.getAttribute('data-localize-key');
			key = key || elTranslate.innerHTML;
			let translate = App.Localize.get(key, App.langGui)
			elTranslate.innerHTML = translate;
			elTranslate.setAttribute('data-localize-key', key);
		})
	}
};
