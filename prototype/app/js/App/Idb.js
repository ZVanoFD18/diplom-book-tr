'use strict';
console.log('App.Idb');

App.Idb = {
	/**
	 * @type {IDBDatabase}
	 */
	_db: undefined,
	getDb(callback) {
		if (this._db) {
			callback(true, this._db);
		} else {
			this.open((isSuccess) => {
				callback(isSuccess, this._db);
			})
		}
	},
	open(callback) {
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
			alert("Пожалуйста закройте все другие вкладки, открытые на этом свйте!");
		};

		request.onupgradeneeded = this.onUpgradeNeeded.bind(this);
		request.onsuccess = (event) => {
			this._db = event.target.result;
			this._db.onversionchange = this.onVersionChange.bind(this);
			callback(true);
		};
		request.onerror = (event) => {
			console.log('Ошибка! Проблема при открытии Вашей БД.');
			callback(false);
		};
	},

	getLastBook(callback) {
		this.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let transaction = db.transaction(['LastSession', 'Books'], 'readonly');
			let storeLastSession = transaction.objectStore('LastSession');
			let req = storeLastSession.get(0);
			req.onsuccess = (event) => {
				if (!event.target.result) {
					callback(false);
					return;
				}
				let storeBooks = transaction.objectStore('Books');
				let index = storeBooks.index('i-hash');
				if (!event.target.result.bookHash) {
					callback(false);
					return;
				}
				let req = index.get(event.target.result.bookHash);
				req.onsuccess = (event) => {
					callback(true, event.target.result);
				};
				req.onerror = (event) => {
					callback(false);
				};
			};
			req.onerror = (event) => {
				callback(false);
			};
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
				tmpObjStore.createIndex('i-lang', 'lang' );

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
