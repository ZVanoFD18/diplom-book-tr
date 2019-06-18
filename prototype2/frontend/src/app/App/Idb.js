'use strict';

import Books from './Idb/Books'
import KeyVal from './Idb/KeyVal'
import WordsStudy from './Idb/WordsStudy'
import WordsTranslate from './Idb/WordsTranslate'

const stat = {
	TRUE: 1,
	FALSE: 0,
	/**
	 *
	 * @type {IDBDatabase}
	 */
	_db: undefined
};
/**
 *
 * Адаптер БД приложения.
 * @type {Object}
 */
export default class Idb {
	/**-----------------------------------------------------------------------
	 * Публикация субмодулей
	 */

	/**
	 *
	 * @return {KeyVal}
	 * @constructor
	 */
	static get Books() {
		return Books;
	}

	/**
	 *
	 * @return {KeyVal}
	 * @constructor
	 */
	static get KeyVal() {
		return KeyVal;
	}

	/**
	 *
	 * @return {WordsStudy}
	 * @constructor
	 */
	static get WordsStudy() {
		return WordsStudy;
	}

	/**
	 *
	 * @return {WordsTranslate}
	 * @constructor
	 */
	static get WordsTranslate() {
		return WordsTranslate;
	}

	/**-----------------------------------------------------------------------
	 * Публикация псевдостатических свойств
	 */

	static get TRUE() {
		return stat.TRUE;
	}

	static get FALSE() {
		return stat.FALSE;
	}

	/**-----------------------------------------------------------------------
	 * Реализация класса
	 */

	/**
	 * Возвращает булево значение, понимаемое IndexedDB.
	 * @param boolValue
	 * @return {*}
	 */
	static getBool(boolValue) {
		return boolValue ? this.TRUE : this.FALSE;
	}

	/**
	 * @TODO: Сделать проверку на наличие свободного места для IndexedDB хранилища
	 */
	static checkQuota() {
		// --------------------------------------------------
		// Google Chrome
		// @see: http://qaru.site/questions/200389/what-are-the-storage-limits-for-the-indexed-db-on-googles-chrome-browser/1092814#1092814
		// Request storage usage and capacity left
		window.webkitStorageInfo.queryUsageAndQuota(webkitStorageInfo.TEMPORARY,
			//the type can be either TEMPORARY or PERSISTENT
			function (used, remaining) {
				console.log("Used quota: " + used + ", remaining quota: " + remaining);
			}, function (e) {
				console.log('Error', e);
			});
	}

	/**
	 *
	 * @return {Promise<any>}
	 */
	static getDb() {
		return new Promise((resolve, reject) => {
			/**
			 *  Кешировать нельзя т.к . после загрузки книги при первой же операции
			 *  получаем ошибку
			 *  в Google Chrome :
			 *  "DOMException: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing."
			 *  в Firefox
			 *  "InvalidStateError: A mutation operation was attempted on a database that did not allow mutations."
			 *  @TODO: нагуглить объяснение этим ошибкам.
			 * */
			// if (stat._db) {
			// 	resolve(stat._db);
			// } else {
			this.open()
				.then((result) => {
					resolve(stat._db);
				})
				.catch((result) => {
					reject(result);
					return;
				})
			// }
		})
	}

	/**
	 * @return {Promise}
	 */
	static open() {
		return new Promise((resolve, reject) => {
			if (!window.indexedDB) {
				window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			}
			//IDBDatabase.onclose = this.onClose.bind(this);
			/**
			 *
			 * @type {IDBOpenDBRequest}
			 */
			let request = indexedDB.open('main', 2);
			request.onblocked = function (event) {
				// If some other tab is loaded with the database, then it needs to be closed
				// before we can proceed.
				alert("Пожалуйста закройте все другие вкладки, открытые на этом сайте!");
			};

			request.onupgradeneeded = this.onUpgradeNeeded.bind(this);
			request.onsuccess = (event) => {
				stat._db = event.target.result;
				stat._db.onversionchange = this.onVersionChange.bind(this);
				stat._db.onclose = this.onClose.bind(this);
				resolve();
			};
			request.onerror = (event) => {
				document.Helper.Log.addDebug('Ошибка! Проблема при открытии БД.');
				alert('Ошибка! Не могу открыть БД.');
				reject();
				return;
			};
		});
	}

	static onClose(e) {
		console.log('Idb/onClose', e);
	}

	static onUpgradeNeeded(event) {
		let tmpObjStore;
		let transaction = event.target.transaction;
		/**
		 *
		 * @type {IDBDatabase}
		 */
		let db = event.target.result;

		switch (event.oldVersion) {
			case 0 :
				//-------------------------------------------------------------
				// Таблица "Хеш-таблица"
				tmpObjStore = db.createObjectStore('KeyVal');
				//-------------------------------------------------------------
				// Таблица "Сохраненные книги"
				tmpObjStore = db.createObjectStore('Books', {
					keyPath: 'hash',
					autoIncrement: false
				});
				tmpObjStore.createIndex('i-lang', 'lang');
				// tmpObjStore.createIndex('i-hash', 'hash', {
				// 	unique: true
				// });
				tmpObjStore.createIndex('i-title', 'title', {
					unique: false
				});
				//-------------------------------------------------------------
				// Таблица "Изучаемые слова"
				tmpObjStore = db.createObjectStore('WordsStudy', {
					keyPath: ['lang', 'word'],
					autoIncrement: false
				});
				tmpObjStore = transaction.objectStore('WordsStudy');
				tmpObjStore.createIndex('i-lang', ['lang'],);
				// tmpObjStore.createIndex('i-lang-word', ['lang', 'word'], {
				// 	unique: true
				// });
				tmpObjStore.createIndex('i-lang-isStudy', ['lang', 'isStudy'], {
					unique: false
				});
			//-------------------------------------------------------------
			// goto next
			case 1 :
				//-------------------------------------------------------------
				// Таблица "Переводы слов"
				tmpObjStore = db.createObjectStore('WordsTranslate', {
					keyPath: ['langFrom', 'langTo', 'word'],
					autoIncrement: false
				});
				// Поиск всех слов по языку
				tmpObjStore.createIndex('i-langFrom', ['langFrom'],);
				// Поиск всех переводов с основного языка на дополнительный
				tmpObjStore.createIndex('i-langFrom-langTo', ['langFrom', 'langTo']);
				// Поиск перевода для конкретного слова
				tmpObjStore.createIndex('i-langFrom-langTo-word', ['langFrom', 'langTo', 'word'], {
					unique: true
				});
			//-------------------------------------------------------------
			// goto next
			default:
				break;
		}

		// Пример проверки индексов
		if (false) {
			if (!db.objectStoreNames.contains('Books')) {
				tmpObjStore = db.createObjectStore('Books');
			}
			tmpObjStore = transaction.objectStore('Books');
			if (!tmpObjStore.indexNames.contains('i-title')) {
				tmpObjStore.createIndex('i-title', 'title', {
					unique: false
				});
			} else if (tmpObjStore.index('i-title').unique) {
				tmpObjStore.deleteIndex('i-title');
				tmpObjStore.createIndex('i-title', 'title', {
					unique: false
				});
			}
		}
	}

	/**
	 * @TODO: Использовать защиту от обновления в соседних вкладках
	 * @see: (https://developer.mozilla.org/ru/docs/IndexedDB/Using_IndexedDB) Version changes while a web app is open in another tab
	 */
	static onVersionChange() {
		stat._db.close();
		alert("Обновленние БД завершено. Пожалуйста обноите страницу!");
	}

	static getNormalizedLang(lang) {
		return lang.toUpperCase();
	}

	/**
	 * Возвращает нормализованное значение слова.
	 * Т.е. в этом регистре храним слова, в этом регистре ищем по базе.
	 * @param word
	 * @return {string}
	 */
	static getNormalizedWord(word) {
		return word.toLowerCase();
	}
};
