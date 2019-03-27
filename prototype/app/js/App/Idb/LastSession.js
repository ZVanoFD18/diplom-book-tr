'use strict';
console.log('App.Idb.LastSession');

App.Idb.LastSession = {
	get(callback) {
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let store = db.transaction(['LastSession'], 'readonly').objectStore('LastSession');
			let req = store.get(0);
			req.onsuccess = (event) => {
				callback(true, event.result);
			};
			req.onerror = (event) => {
				callback(false);
			};
		});
	},
	put(session, callback) {
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let transaction = db.transaction(['LastSession'], 'readwrite');
			let store = transaction.objectStore('LastSession');
			let data = {
				bookHash: session.bookHash,
				bookPosition: session.bookPosition
			};
			let req = store.put(data, 0);
			req.onsuccess = (event) => {
				callback(true, event.result);
			};
			req.onerror = (event) => {
				callback(false);
			};

		});
	}
};