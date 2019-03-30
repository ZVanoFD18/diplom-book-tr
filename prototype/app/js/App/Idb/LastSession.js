'use strict';
console.log('App.Idb.LastSession');

App.Idb.LastSession = {
	/**
	 * Ключ, которым помечается единственная запись в таблице
	 */
	KEY: 0,
	Struct: {
		version: 1,
		bookHash: undefined,
		bookPosition: undefined
	},
	get() {
		return App.Idb.getDb().then((db) => {
			return new Promise((resolve, reject) => {
				let store = db.transaction(['LastSession'], 'readonly').objectStore('LastSession');
				let req = store.get(0);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject('Не удалось получить сессию из БД.');
				};
			})
		});
	},
	put(bookHash, bookPosition) {
		let record = Object.assign({}, this.Struct);
		record.bookHash = bookHash;
		record.bookPosition = bookPosition;
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				let transaction = db.transaction(['LastSession'], 'readwrite');
				let store = transaction.objectStore('LastSession');
				let req = store.put(record, this.KEY);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject('Не удалось записать сессию в БД.');
				};
			})
		});
	}
};