'use strict';
console.log('App.Idb.KeyVal.LastSession');

App.Idb.KeyVal.LastSession = {
	Struct: {
		version: 1,
		bookHash: undefined,
		bookPosition: undefined
	},
	put(bookHash, bookPosition) {
		let data = Object.assign({}, this.Struct);
		data = Helper.Obj.replaceMembers(data, {
			bookHash  : bookHash,
			bookPosition  : bookPosition
		});
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				let transaction = db.transaction(['KeyVal'], 'readwrite');
				let store = transaction.objectStore('KeyVal');
				let req = store.put(data, App.Idb.KeyVal.KEYS.LAST_SESSION);
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