'use strict';

const stat = {
	/**
	 * Структура, описывающая изучаемое слово.
	 */
	Struct: {
		/**
		 * Версия структуры на момент записи информации.
		 * @type {Number}
		 */
		version: 1,
		/**
		 * Язык слова (Напр. "ENG" или "RUS")
		 * @type {String}
		 */
		lang: undefined,
		/**
		 * Нормализованный текст слова (Напр. "dog", "яблоко")
		 * @type {String}
		 */
		word: undefined,
		/**
		 * Флаг: Слово для изучения? 0 - нет, 1 - Да.
		 * 0 - слово уже изучено.
		 * 1 - слово не изучено - прогнать через процесс изучения.
		 * @type {Number}
		 */
		isStudy: undefined,
		/**
		 * Флаг: Завершено ли изучение слова с родного языка на изучаемый?
		 * 0 - Нет, 1 - Да
		 * @type {Number}
		 */
		isFinishedLang1ToLang2: undefined,
		/**
		 * Флаг: Завершено ли изучение слова с изучаемого языка на основной
		 *  0 - Нет, 1 - Да
		 * @type {Number}
		 */
		isFinishedLang2ToLang1: undefined
	}
};
/**
 *
 * Объект, предоставляющий интерфейс к таблице "Изучаемые слова".
 * @type {Object}}
 */
export default class WordsStudy {

	static getStruct() {
		let result = Object.assign({}, stat.Struct);
		return result;
	}

	static getStructFromData(data) {
		if (!document.Helper.isDefined(data)) {
			return undefined;
		}
		let result = this.getStruct();
		result = document.Helper.Obj.replaceMembers(result, data, false);
		return result;
	}

	/**
	 * Возвращает структуру из БД.
	 * @param lang
	 * @param word
	 */
	static get(lang, word) {
		return new Promise((resolve, reject) => {
			return document.App.Idb.getDb().then((db) => {
				let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
				//let index = store.index('i-lang-word');
				//let req = index.get([ document.App.Idb.getNormalizedLang(lang), document.App.Idb.getNormalizedWord(word)]);
				let req = store.get([document.App.Idb.getNormalizedLang(lang), document.App.Idb.getNormalizedWord(word)]);
				req.onsuccess = (event) => {
					resolve(this.getStructFromData(event.target.result));
				};
				req.onerror = (event) => {
					reject();
				};
			})
		});
	}

	static getAllAsObject(lang, filters = {}) {
		document.Helper.Obj.replaceMembers({
			from: undefined,
			to: undefined
		}, filters);
		return new Promise((resolve, reject) => {
			let result = {};
			let cnr = 0;
			document.App.Idb.getDb().then((db) => {
				const normalizedLang = document.App.Idb.getNormalizedLang(lang);
				let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
				let index = store.index('i-lang');
				const key = IDBKeyRange.only([document.App.Idb.getNormalizedLang(lang)]);
				let req = index.openCursor(key);
				req.onsuccess = (event) => {
					let cursor = req.result;
					if (!cursor) {
						resolve(result);
						return;
					}
					if (document.Helper.isDefined(filters.from) && document.Helper.isDefined(filters.to)) {
						if (cnr >= filters.from && cnr <= filters.to) {
							result[cursor.value.word] = cursor.value;
						}
					} else {
						result[cursor.value.word] = cursor.value;
					}
					++cnr;
					cursor.continue()
				}
			}).catch((e) => {
				throw e;
			});
		})
	}

	/**
	 * Вставить или обновить слово.
	 * @param lang
	 * @param word
	 * @param data - Данные структуры для обновления. Приме
	 */
	static put(lang, word, data) {
		data = data || {};
		lang = lang || data.lang;
		word = word || data.word;
		let db, key;
		return new Promise((resolve, reject) => {
			if (!document.Helper.isString(lang) || !document.Helper.isString(word)) {
				throw new Error('lang не задан');
			}
			document.App.Idb.getDb().then((resDb) => {
				db = resDb;
				return this.get(lang, word);
			}).then((existsStruct) => {
				return new Promise((resolve, reject) => {
					let newStruct = existsStruct;
					if (!newStruct) {
						newStruct = this.getStruct();
						document.Helper.Obj.apply(newStruct, {
							lang: document.App.Idb.getNormalizedLang(lang),
							word: document.App.Idb.getNormalizedWord(word)
						});
					}
					document.Helper.Obj.apply(newStruct, data);
					let transaction = db.transaction(['WordsStudy'], 'readwrite');
					let store = transaction.objectStore('WordsStudy');
					let req = store.put(newStruct);
					req.onsuccess = (event) => {
						resolve(event.target.result);
					};
					req.onerror = (event) => {
						reject();
					};
				});
			}).then((result) => {
				resolve(result);
			}).catch((e) => {
				reject(e);
			});
		});
	}

	static getForStudy(lang, count) {
		return new Promise((resolve, reject) => {
			let result = [];
			document.App.Idb.getDb().then((db) => {
				let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
				/**
				 * @type {IDBIndex}
				 */
				let index = store.index('i-lang-isStudy');
				const key = IDBKeyRange.only([document.App.Idb.getNormalizedLang(lang), document.App.Idb.TRUE]);
				let req = index.openCursor(key);
				req.onsuccess = (event) => {
					let cursor = req.result;
					if (!cursor) {
						resolve(result);
						return;
					}
					result.push(cursor.value);
					if (result.length < count) {
						cursor.continue()
					} else {
						resolve(result);
					}
				};
				req.onerror = (event) => {
					reject('Не удалось получить слова по индексу.');
				};
			}).catch((e) => {
				document.Helper.Log.addDebug(e);
				reject(e);
			});
		});
	}

	static getCountStudy(lang, isStudy) {
		return new Promise((resolve, reject) => {
			document.App.Idb.getDb().then((db) => {
				return new Promise((resolve, reject) => {
					let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
					/**
					 * @type {IDBIndex}
					 */
					let index = store.index('i-lang-isStudy');
					const key = IDBKeyRange.only([document.App.Idb.getNormalizedLang(lang), isStudy]);
					let req = index.count(key);
					req.onsuccess = (event) => {
						return new Promise(() => {
							resolve(req.result);
						});
					};
					req.onerror = (event) => {
						reject('Не удалось извлечь количество слов по индексу.');
					};
				});
			}).then((result) => {
				resolve(result);
			}).catch((e) => {
				reject(e);
			});
		});
	}

	static getStat(lang) {
		let result = {
			cntStudy: undefined,
			cntStudied: undefined
		};
		return new Promise((resolve, reject) => {
			this.getCountStudy(lang, document.App.Idb.TRUE).then((cnt) => {
				result.cntStudy = cnt;
				return this.getCountStudy(lang, document.App.Idb.FALSE);
			}).then((cnt) => {
				result.cntStudied = cnt;
				resolve(result);
			}).catch((e) => {
				document.App.Log.addDebug(e);
				reject(e);
			});
		})
	}

	static getCountForLang(lang) {
		return new Promise((resolve, reject) => {
			document.App.Idb.getDb().then((db) => {
				return new Promise((resolve, reject) => {
					let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
					/**
					 * @type {IDBIndex}
					 */
					let index = store.index('i-lang');
					const key = IDBKeyRange.only([document.App.Idb.getNormalizedLang(lang)]);
					let req = index.count(key);
					req.onsuccess = (event) => {
						resolve(req.result);
					};
					req.onerror = (event) => {
						document.App.Log.addDebug(event);
						reject('Не удалось извлечь количество слов по индексу.');
					};
				});
			}).then((result) => {
				resolve(result);
			}).catch((e) => {
				reject(e);
			});
		});
	}
};