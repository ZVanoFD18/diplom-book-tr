'use strict';
console.log('App.Idb');

App.Idb = {
	TRUE: 1,
	FALSE: 0,
	/**
	 * @type {IDBDatabase}
	 */
	_db: undefined,
	getBool(boolValue){
		return boolValue ? this.TRUE : this.FALSE;
	},
	/**
	 * @TODO: Сделать проверку на наличие свободного места для IndexedDB хранилища
	 */
	checkQuota() {
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
	},
	/**
	 *
	 * @return {Promise<any>}
	 */
	getDb() {
		return new Promise((resolve, reject) => {
			if (this._db) {
				resolve(this._db);
			} else {
				this.open()
					.then((result) => {
						resolve(this._db);
					})
					.catch((result) => {
						reject(result);
					})
			}
		})
	},
	/**
	 * @return {Promise}
	 */
	open() {
		return new Promise((resolve, reject) => {
			if (!window.indexedDB) {
				window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			}
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
				this._db = event.target.result;
				this._db.onversionchange = this.onVersionChange.bind(this);
				resolve();
			};
			request.onerror = (event) => {
				Helper.Log.addDebug('Ошибка! Проблема при открытии БД.');
				alert('Ошибка! Не могу открыть БД.');
				reject();
			};
		});
	},
	onUpgradeNeeded(event) {
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
				// Поиска всех слов по языку
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
	},

	/**
	 * @TODO: Использовать защиту от обновления в соседних вкладках
	 * @see: (https://developer.mozilla.org/ru/docs/IndexedDB/Using_IndexedDB) Version changes while a web app is open in another tab
	 */
	onVersionChange() {
		this._db.close();
		alert("Обновленние БД завершено. Пожалуйста обноите страницу!");
	},
	getNormalizedLang(lang) {
		return lang.toUpperCase();
	},
	/**
	 * Возвращает нормализованное значение слова.
	 * Т.е. в этом регистре храним слова, в этом регистре ищем по базе.
	 * @param word
	 * @return {string}
	 */
	getNormalizedWord(word) {
		return word.toLowerCase();
	},
	getLastBook(callback) {
		let db;
		return new Promise((resolve, reject) => {
			App.Idb.KeyVal.get(App.Idb.KeyVal.KEYS.LAST_SESSION).then((lastSession) => {
				console.log('getLastBook/lastSession');
				if (!lastSession) {
					resolve(undefined);
					return;
				}
				return App.Idb.Books.getByHash(lastSession.bookHash);
			}).then((lastBook) => {
				console.log('getLastBook/lastBook');
				resolve(lastBook);
			}).catch((e) => {
				Helper.Log.addDebug(e);
				reject(e);
			});
		});
	}
};
