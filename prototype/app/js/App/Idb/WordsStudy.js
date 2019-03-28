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
		result.lang = data.lang;
		result.word = data.word;
		result.isStudy = data.isStudy;
		result.cntCorrect = data.cntCorrect;
		result.cntIncorrect = data.cntIncorrect;
		return result;
	},
	getNormalizedLang(lang) {
		return lang.toUpperCase();
	},
	getNormalizedWord(word) {
		return word.toLowerCase();
	},
	/**
	 * Врзвращает ключ для слова.
	 * @param lang
	 * @param word
	 * @param callback
	 */
	getKey(lang, word, callback) {
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
			let index = store.index('i-lang-word');
			let req = index.getKey([this.getNormalizedLang(lang), this.getNormalizedWord(word)]);
			req.onsuccess = (event) => {
				callback(true, req.result);
			};
			req.onerror = (event) => {
				callback(false);
			};
		});
	},
	/**
	 * Возвращает структуру из БД.
	 * @param lang
	 * @param word
	 * @param callback
	 */
	get(lang, word, callback) {
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
			let index = store.index('i-lang-word');
			let req = index.get([this.getNormalizedLang(lang), this.getNormalizedWord(word)]);
			req.onsuccess = (event) => {
				callback(true, this.getStructFromData(event.target.result));
			};
			req.onerror = (event) => {
				callback(false);
			};
		});
	},
	/**
	 * Вставить или обновить слово.
	 * @param lang
	 * @param word
	 * @param data - Данные структуры для обновления. Приме
	 * @param callback
	 */
	put(lang, word, data, callback) {
		data = data || {};
		lang = lang || data.lang;
		word = word || data.word;
		if (!Helper.isString(lang) || !Helper.isString(word)) {
			callback(false);
		}
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			this.getKey(lang, word, (isSuccess, key) => {
				this.get(lang, word, (isSuccess, existsStruct) => {
					if (!isSuccess) {
						callback(false);
						return;
					}
					if (!existsStruct) {
						existsStruct = this.getStruct();
					}
					Helper.Object.apply(existsStruct, data);
					Helper.Object.apply(existsStruct, {
						lang: this.getNormalizedLang(lang),
						word: this.getNormalizedWord(word)
					});

					let transaction = db.transaction(['WordsStudy'], 'readwrite');
					let store = transaction.objectStore('WordsStudy');
					let req = store.put(existsStruct, key);
					req.onsuccess = (event) => {
						callback(true, event.target.result);
					};
					req.onerror = (event) => {
						callback(false);
					};
				});
			});
		});
	},
	getCountStudy(lang, callback) {
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
			/**
			 * @type {IDBIndex}
			 */
			let index = store.index('i-lang-isStudy');
			// @TODO: Разобраться с композитным индексом.
			const key = IDBKeyRange.only([this.getNormalizedLang(lang), 1]);
			let req = index.count(key);
			req.onsuccess = (event) => {
				callback(true, req.result);
			};
			req.onerror = (event) => {
				callback(false);
			};
		});

		// @TODO: Разобраться и переделать на Promise
		// return new Promise((resolve, reject) => {
		// 	return new Promise(() => {
		// 		App.Idb.getDb((isSuccess, db) => {
		// 			if (!isSuccess) {
		// 				reject();
		// 				return;
		// 			}
		// 			resolve(db);
		// 			//return db;
		// 		});
		// 	});
		// }).then((db) => {
		// 	let store = db.transaction(['WordsStudy'], 'readonly').objectStore('WordsStudy');
		// 	/**
		// 	 * @type {IDBIndex}
		// 	 */
		// 	let index = store.index('i-lang-isStudy');
		// 	// @TODO: Разобраться с композитным индексом.
		// 	const key = IDBKeyRange.only([this.getNormalizedLang(lang), 1]);
		// 	let req = index.count(key);
		// 	req.onsuccess = (event) => {
		// 		return new Promise(()=>{
		// 			resolve(true, req.result);
		// 		});
		// 	};
		// 	req.onerror = (event) => {
		// 		reject();
		// 	};
		// }).catch(() => {
		// 	reject();
		// });

	}
};