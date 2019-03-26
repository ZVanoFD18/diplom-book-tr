'use strict';
console.log('App.Idb');

App.Idb = {
	/**
	 * @type {IDBDatabase}
	 */
	db: undefined,
	getDb(callback){
		if(this.db){
			callback(true, this.db);
		} else {
			this.open((isSuccess)=>{
                callback(isSuccess, this.db);
			})
		}
	},
	open(callback) {
		if(!window.indexedDB){
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
			this.db = event.target.result;
			this.db.onversionchange = this.onVersionChange.bind(this);
			callback(true);
		};
		request.onerror = (event) => {
			console.log('Ошибка! Проблема при открытии Вашей БД.');
			callback(false);
		};
	},
	hasBooks() {
		return false;
	},
	getLastBook(callback) {
		this.getDb((isSuccess, db)=>{
			if (!isSuccess){
				callback(false);
				return;
			}
            let transaction = db.transaction(['LastSession', 'Books'], 'readonly');
            let storeLastSession = transaction.objectStore('LastSession');
            let req = storeLastSession.get(0);
            req.onsuccess = (event) => {
                let storeBooks = transaction.objectStore('Books');
                var index = storeBooks.index("iHash");
                // @TODO: разобраться как искать по полям
                //let req = storeBooks.getAll({hash : event.target.result.bookHash}, 1);
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
		/**
		 *
		 * @type {IDBDatabase}
		 */
		let db = event.target.result;
		if (!db.objectStoreNames.contains('Books')) {
			tmpObjStore = db.createObjectStore('Books', {
				keyPath: 'id',
				autoIncrement: true
			});
			tmpObjStore.createIndex('iHash', 'hash', {
				unique: true
			});
            tmpObjStore.createIndex('iTitle', 'title', {
                unique: true
            });
		}
		if (!db.objectStoreNames.contains('LastSession')) {
			tmpObjStore = db.createObjectStore('LastSession', {
				//keyPath: 'id'
			});
		}
        // if (!db.objectStoreNames.contains('Lobs')) {
        //     tmpObjStore = db.createObjectStore('Lobs', {
        //         keyPath: 'id',
        //         autoIncrement: true
        //     });
        //     tmpObjStore.createIndex('iHash', 'hash', {
        //         unique: true
        //     });
        // }
	},
	/**
	 * @TODO: разработать механизм, который поэтапно обновит структуру и данные БД.
	 * @param event
	 */
	onUpgradeNeeded2(event) {
		var tmpObjStore;
		/**
		 *
		 * @type {IDBDatabase}
		 */
		let db = event.target.result;
		db.onversionchange = this.onVersionChange.bind(this);
		let currentVersion = -1;
		// if (!db.objectStoreNames.contains('Metadata')) {
		// 	tmpObjStore = db.createObjectStore('Metadata', {keyPath: 'id', autoIncrement: true});
		// 	currentVersion = 0;
		// }
		extractCurrentVersion((isSuccess) => {
			if (!isSuccess) {
				alert('@TODO: Битая структура БД.');
				return;
			}
			updateDb()
		});

		function extractCurrentVersion(callback) {
			if (!db.objectStoreNames.contains('Metadata')) {
				currentVersion = -1;
				callback(true);
				return;
			}
			let transaction = db.transaction(['Metadata'], 'read');
			let store = transaction.objectStore('Metadata');
			let request = store.get(0);
			request.onsuccess = (event) => {
				var myRecord = request.result;
				console.log(myRecord);
				callback(true);
			};
			request.onerror = () => {
				callback(false);
			}
		}
		function updateDb(callback) {
			switch (currentVersion) {
				case -1:
					tmpObjStore = db.createObjectStore('Metadata', {keyPath: 'id', autoIncrement: true});
					++currentVersion;
					update(callback);
					break;
				case 0 :
					tmpObjStore = db.createObjectStore('Books', {keyPath: 'id', autoIncrement: true});
					tmpObjStore.createIndex('iHash', 'hash', {unique: true});
					++currentVersion;
					update(callback);
					break;
				case 1:
					//IDBFactory.
					tmpObjStore = db.createObjectStore('LastSession', {keyPath: 'id', autoIncrement: true});
					++currentVersion;
					update(callback);
					break;
				default :
					callback(true);
			}
		}
		function updateMetadataVersion(newVersion, callback) {
			let store = db.transaction(['Metadata'], 'readwrite').objectStore('Metadata');
			let item = {
				version: newVersion
			};
			let request = store.put(item, 0);
			request.onsuccess = () => {
				currentVersion = newVersion;
				callback(true);
			};
			request.onerror = () => {
				callback(false);
			};
		}
	},
	/**
	 * @TODO: Использовать защиту от обновления в соседних вкладках
	 * @see: (https://developer.mozilla.org/ru/docs/IndexedDB/Using_IndexedDB) Version changes while a web app is open in another tab
	 */
	onVersionChange() {
		this.db.close();
		alert("Обновленние БД завершено. Пожалуйста обноите страницу!");
	}
};
