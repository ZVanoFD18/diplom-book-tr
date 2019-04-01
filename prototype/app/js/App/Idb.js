'use strict';
console.log('App.Idb');

App.Idb = {
	TRUE: 1,
	FALSE: 0,
	/**
	 * @type {IDBDatabase}
	 */
	_db: undefined,
	/**
	 *
	 * @param callback
	 * @return {Promise<any>}
	 */
	getDb(callback) {
		if (Helper.isFunction(callback)) {
			Helper.Log.addTodo('Нужно использовать Promise');
			this.getDb()
				.then(() => {
					callback(true, this._db)
				})
				.catch((result) => {
					callback(false);
				})
		} else {
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
		}
	},
	/**
	 *
	 * @param callback
	 * @return {Promise}
	 */
	open(callback) {
		if (Helper.isFunction(callback)) {
			Helper.Log.addTodo('Нужно использовать Promise');
			this.open()
				.then(() => {
					callback(true)
				})
				.catch((result) => {
					callback(false);
				})
		} else {
			return new Promise((resolve, reject) => {
				if (!window.indexedDB) {
					window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
				}
				/**
				 *
				 * @type {IDBOpenDBRequest}
				 */
				let request = indexedDB.open('main', 1);
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
					Helper.Log.addDebug('Ошибка! Проблема при открытии Вашей БД.');
					reject();
				};
			});
		}

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
		return new Promise((resolve, reject) => {
			let db;
			this.getDb().then((resDb) => {
				db = resDb;
				return new Promise((resolve, reject) => {
					let transaction = db.transaction(['LastSession'], 'readonly');
					let store = transaction.objectStore('LastSession');
					let req = store.get(0);
					req.onsuccess = (event) => {
						resolve(req.result);
					};
					req.onerror = (event) => {
						reject();
					};
				});
			}).then((lastSession) => {
				if (!lastSession) {
					resolve(undefined);
					return;
				}
				let transaction = db.transaction(['Books'], 'readonly');
				let store = transaction.objectStore('Books');
				let index = store.index('i-hash');
				let req = index.get(lastSession.bookHash);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject();
				};
			});
		});
	},
	onUpgradeNeeded(event) {
		var tmpObjStore;
		let transaction = event.target.transaction;
		/**
		 *
		 * @type {IDBDatabase}
		 */
		let db = event.target.result;

		switch (event.oldVersion) {
			case 0 :
				tmpObjStore = db.createObjectStore('Books', {
					// keyPath: 'id',
					autoIncrement: true
				});
				tmpObjStore.createIndex('i-lang', 'lang');

				tmpObjStore.createIndex('i-hash', 'hash', {
					unique: true
				});
				tmpObjStore.createIndex('i-title', 'title', {
					unique: false
				});

				tmpObjStore = db.createObjectStore('LastSession');

				tmpObjStore = db.createObjectStore('WordsStudy', {
					autoIncrement: true
				});
				tmpObjStore = transaction.objectStore('WordsStudy');
				tmpObjStore.createIndex('i-lang', ['lang'],);
				tmpObjStore.createIndex('i-lang-word', ['lang', 'word'], {
					unique: true
				});
				tmpObjStore.createIndex('i-lang-isStudy', ['lang', 'isStudy'], {
					unique: false
				});
			// goto next
			case 1 :
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
	},

	/**
	 * @TODO: Использовать защиту от обновления в соседних вкладках
	 * @see: (https://developer.mozilla.org/ru/docs/IndexedDB/Using_IndexedDB) Version changes while a web app is open in another tab
	 */
	onVersionChange() {
		this._db.close();
		alert("Обновленние БД завершено. Пожалуйста обноите страницу!");
	}
};
