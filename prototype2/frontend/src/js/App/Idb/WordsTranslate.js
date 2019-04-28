'use strict';

const stat = {
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
		score: undefined,
		/**
		 * Время последней записи слова в таблицу (формат timestamp).
		 * @type {Number}
		 */
		insertAt: 0
	}
};
/**
 * Объект, предоставляющий интерфейс к таблице "Перевод слов".
 * @type {Object}}
 */
export default class WordsTranslate {

	static getStruct() {
		return Object.assign({}, stat.Struct);
	}

	static getStructFromData(data) {
		if (!document.Helper.isDefined(data)) {
			return undefined;
		}
		let result = this.getStruct();
		result = document.Helper.Obj.replaceMembers(result, data);
		return result;
	}

	/**
	 * Возвращает структуру из БД.
	 * @param langFrom
	 * @param langTo
	 * @param word
	 */
	static get(langFrom, langTo, word) {
		return new Promise((resolve, reject) => {
			return document.App.Idb.getDb().then((db) => {
				let store = db.transaction(['WordsTranslate'], 'readonly').objectStore('WordsTranslate');
				let index = store.index('i-langFrom-langTo-word');
				let req = index.get([document.App.Idb.getNormalizedLang(langFrom), document.App.Idb.getNormalizedLang(langTo), document.App.Idb.getNormalizedWord(word)]);
				req.onsuccess = (event) => {
					resolve(this.getStructFromData(event.target.result));
				};
				req.onerror = (event) => {
					reject();
				};
			})
		});
	}

	/**
	 * Вставить или обновить перевод слова.
	 * @param langFrom
	 * @param langTo
	 * @param word
	 * @param translate
	 * @param score
	 */
	static put(langFrom, langTo, word, translate, score) {
		return new Promise((resolve, reject) => {
			document.App.Idb.getDb().then((db) => {
				let struct = this.getStruct();
				document.Helper.Obj.apply(struct, {
					langFrom: document.App.Idb.getNormalizedLang(langFrom),
					langTo: document.App.Idb.getNormalizedLang(langTo),
					word: document.App.Idb.getNormalizedWord(word),
					translate: document.App.Idb.getNormalizedWord(translate),
					score: score,
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
