'use strict';
console.log('App.Idb.WordsStudy');
/**
 * Объект, предоставляющий интерфейс к таблице "Изучаемые слова".
 * @type {Object}}
 */
App.Idb.WordsStudy = {
	Struct: {
		version: 1,
		lang: undefined,
		word: undefined,
		isStudy: undefined,
		cntCorrect: 0,
		cntIncorrect: 0
	},
	getStruct() {
		return Object.assign({}, this.Struct);
	},
	getStructFromData(data) {
		if (!Helper.isDefined(data)) {
			return undefined;
		}
		let result = this.getStruct();
		Helper.Object.replaceMembers(result, data);
		return result;
	},

	/**
	 * Врзвращает ключ для слова.
	 * @param lang
	 * @param word
	 */
	getKey(lang, word) {
		return App.Idb.getDb().then((db) => {
			return new Promise((resolve, reject) => {
				let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
				let index = store.index('i-lang-word');
				let req = index.getKey([App.Idb.getNormalizedLang(lang), App.Idb.getNormalizedWord(word)]);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject();
				};
			})
		});
	},
	/**
	 * Возвращает структуру из БД.
	 * @param lang
	 * @param word
	 */
	get(lang, word) {
		return new Promise((resolve, reject) => {
			return App.Idb.getDb().then((db) => {
				let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
				let index = store.index('i-lang-word');
				let req = index.get([App.Idb.getNormalizedLang(lang), App.Idb.getNormalizedWord(word)]);
				req.onsuccess = (event) => {
					resolve(this.getStructFromData(event.target.result));
				};
				req.onerror = (event) => {
					reject();
				};
			})
		});
	},
	getAll(lang, filters={}) {
		Helper.Object.replaceMembers({
			from : undefined,
			to : undefined
		}, filters);
		return new Promise((resolve, reject) => {
			let result = {};
			let cnr=0;
			App.Idb.getDb().then((db) => {
				const normalizedLang = App.Idb.getNormalizedLang(lang);
				let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
				let index = store.index('i-lang');
				const key = IDBKeyRange.only([App.Idb.getNormalizedLang(lang)]);
				let req = index.openCursor(key);
				req.onsuccess = (event) => {
					let cursor = req.result;
					if (!cursor) {
						resolve(result);
						return;
					}
					if(Helper.isDefined(filters.from) && Helper.isDefined(filters.to)){
						if (cnr >= filters.from && cnr <= filters.to){
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
	},
	/**
	 * Вставить или обновить слово.
	 * @param lang
	 * @param word
	 * @param data - Данные структуры для обновления. Приме
	 */
	put(lang, word, data) {
		data = data || {};
		lang = lang || data.lang;
		word = word || data.word;
		let db, key;
		return new Promise((resolve, reject) => {
			if (!Helper.isString(lang) || !Helper.isString(word)) {
				throw new Error('lang не задан');
			}
			App.Idb.getDb().then((resDb) => {
				db = resDb;
				return this.getKey(lang, word);
			}).then((resKey) => {
				key = resKey;
				return this.get(lang, word);
			}).then((existsStruct) => {
				return new Promise((resolve, reject) => {
					if (!existsStruct) {
						existsStruct = this.getStruct();
					}
					Helper.Object.apply(existsStruct, data);
					Helper.Object.apply(existsStruct, {
						lang: App.Idb.getNormalizedLang(lang),
						word: App.Idb.getNormalizedWord(word)
					});
					let transaction = db.transaction(['WordsStudy'], 'readwrite');
					let store = transaction.objectStore('WordsStudy');
					let req = store.put(existsStruct, key);
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
	},
	getCountStudy(lang, isStudy) {
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				return new Promise((resolve, reject) => {
					let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
					/**
					 * @type {IDBIndex}
					 */
					let index = store.index('i-lang-isStudy');
					const key = IDBKeyRange.only([App.Idb.getNormalizedLang(lang), isStudy]);
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
	},
	getStat(lang) {
		let result = {
			cntStudy: undefined,
			cntStudied: undefined
		};
		return new Promise((resolve, reject) => {
			this.getCountStudy(lang, App.Idb.TRUE).then((cnt) => {
				result.cntStudy = cnt;
				return this.getCountStudy(lang, App.Idb.FALSE);
			}).then((cnt) => {
				result.cntStudied = cnt;
				resolve(result);
			}).catch((e) => {
				App.Log.addDebug(e);
				reject(e);
			});
		})
	},
	getCountForLang(lang) {
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				return new Promise((resolve, reject) => {
					let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
					/**
					 * @type {IDBIndex}
					 */
					let index = store.index('i-lang');
					const key = IDBKeyRange.only([App.Idb.getNormalizedLang(lang)]);
					let req = index.count(key);
					req.onsuccess = (event) => {
						resolve(req.result);
					};
					req.onerror = (event) => {
						App.Log.addDebug(event);
						reject('Не удалось извлечь количество слов по индексу.');
					};
				});
			}).then((result) => {
				resolve(result);
			}).catch((e) => {
				reject(e);
			});
		});
	},
};