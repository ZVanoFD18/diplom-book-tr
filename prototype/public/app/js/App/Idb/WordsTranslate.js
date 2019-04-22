'use strict';
// app/js/App/Idb/WordsTranslate.js
/**
 * Объект, предоставляющий интерфейс к таблице "Перевод слов".
 * @type {Object}}
 */
App.Idb.WordsTranslate = {
	/**
	 * Структура, описывающая перевод слова.
	 */
	Struct: {
		/**
		 * Версия структуры на момент записи информации.
		 * @type {Number}
		 */
		version: 1,
		/**
		 * Для какого языка перевод слова (Напр. "ENG" или "RUS")
		 * @type {String}
		 */
		langFrom: undefined,
		/**
		 * На какой язык перевод слова (Напр. "ENG" или "RUS")
		 * @type {String}
		 */
		langTo: undefined,
		/**
		 * Нормализованный текст слова (Напр. "dog" или "яблоко")
		 * @type {String}
		 */
		word: undefined,
		/**
		 * Нормализованный перевод слова (Напр. "собака" или "apple")
		 * @type {String}
		 */
		translate: undefined,
		/**
		 * Частота употребления слова.
		 * Дробное от 0 до 1. 1 = 100% означает, что слово имеет единствее значение.
		 * @type {Number}
		 */
		score : undefined,
		/**
		 * Время последней записи слова в таблицу (формат timestamp).
		 * @type {Number}
		 */
		insertAt: 0
	},
	getStruct() {
		return Object.assign({}, this.Struct);
	},
	getStructFromData(data) {
		if (!Helper.isDefined(data)) {
			return undefined;
		}
		let result = this.getStruct();
		result = Helper.Obj.replaceMembers(result, data);
		return result;
	},

	/**
	 * Возвращает структуру из БД.
	 * @param langFrom
	 * @param langTo
	 * @param word
	 */
	get(langFrom, langTo, word) {
		return new Promise((resolve, reject) => {
			return App.Idb.getDb().then((db) => {
				let store = db.transaction(['WordsTranslate'], 'readonly').objectStore('WordsTranslate');
				let index = store.index('i-langFrom-langTo-word');
				let req = index.get([App.Idb.getNormalizedLang(langFrom), App.Idb.getNormalizedLang(langTo), App.Idb.getNormalizedWord(word)]);
				req.onsuccess = (event) => {
					resolve(this.getStructFromData(event.target.result));
				};
				req.onerror = (event) => {
					reject();
				};
			})
		});
	},
	/**
	 * Вставить или обновить перевод слова.
	 * @param langFrom
	 * @param langTo
	 * @param word
	 * @param translate
	 * @param score
	 */
	put(langFrom, langTo, word, translate, score) {
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				let struct = this.getStruct();
				Helper.Obj.apply(struct, {
					langFrom: App.Idb.getNormalizedLang(langFrom),
					langTo: App.Idb.getNormalizedLang(langTo),
					word: App.Idb.getNormalizedWord(word),
					translate: App.Idb.getNormalizedWord(translate),
					score : score,
					insertAt: Date.now()
				});
				let transaction = db.transaction(['WordsTranslate'], 'readwrite');
				let store = transaction.objectStore('WordsTranslate');
				let req = store.put(struct);
				req.onsuccess = (event) => {
					resolve(event.target.result);
				};
				req.onerror = (event) => {
					reject();
				};
			}).then((result) => {
			}).catch((e) => {
				reject(e);
			});
		});
	}
};