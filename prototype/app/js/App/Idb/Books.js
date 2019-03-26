'use strict';
console.log('App.Idb.Books');

App.Idb.Books = {
	add(title, image, text, callback){
		let transaction = App.Idb.db.transaction(['Books'], 'readwrite'); //readonly - для чтения
		let store = transaction.objectStore('Books');
		let item = {
            title : title,
            image : image,
            hash : undefined,
            content : text
		};
		item.hash = Helper.Hash.md5(item.content);
		let req = store.put(item);
		req.onsuccess = (event) => {
			callback(true, event.result, item.hash);
		};
		req.onerror = (event) => {
			callback(false);
		};
	}
};