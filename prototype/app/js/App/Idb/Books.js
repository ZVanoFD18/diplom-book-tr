'use strict';
console.log('App.Idb.Books');

App.Idb.Books = {
	add(lang, title, image, text, callback) {
		App.Idb.getDb((isSuccess, db) => {
			if (!isSuccess) {
				callback(false);
				return;
			}
			let transaction = db.transaction(['Books'], 'readwrite'); //readonly - для чтения
			let store = transaction.objectStore('Books');
			let item = {
				lang : lang,
				title: title,
				image: image,
				hash: undefined,
				content: text
			};
			item.hash = Helper.Hash.md5(item.content);
			var index = store.index('i-hash');
			let req = index.get(item.hash);
			req.onsuccess = (event) => {
				if (undefined !== event.target.result) {
					callback(true, event.result, item.hash);
					return;
				}
				let req = store.put(item);
				req.onsuccess = (event) => {
					callback(true, event.result, item.hash);
				};
				req.onerror = (event) => {
					callback(false);
				};
			};
			req.onerror = (event) => {
				callback(false);
			};
		});
	}
};