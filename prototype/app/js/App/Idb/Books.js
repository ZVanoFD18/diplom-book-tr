'use strict';
console.log('App.Idb.Books');

App.Idb.Books = {
	Struct: {
		version: 1,
		lang: undefined,
		title: undefined,
		image: undefined,
		hash: undefined,
		content: undefined
	},
	/**
	 *
	 * @param hash
	 * @return {Promise<any>}
	 */
	getKeyByHash(hash) {
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				let store = db.transaction(['Books'], 'readonly').objectStore('Books');
				let index = store.index('i-hash');
				let req = index.getKey(hash);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject();
				};
			});
		});
	},
	/**
	 *
	 * @param hash
	 * @return {Promise<any>}
	 */
	getByHash(hash) {
		let result = {
			key: undefined,
			book: undefined
		};
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				let transaction = db.transaction(['Books'], 'readonly'); //readonly - для чтения
				let store = transaction.objectStore('Books');
				let index = store.index('i-hash');
				let req = index.get(hash);
				req.onsuccess = (event) => {
					if (undefined !== req.result) {
						result.book = req.result;
						this.getKeyByHash(hash).then((key) => {
							result.key = key;
							resolve(result);
						}).catch((e) => {
							reject(e);
						});
					} else {
						resolve(undefined);
					}
				};
				req.onerror = (event) => {
					Helper.Log.addDebug(event);
					reject('Ошибка при поиске книги по хешу.');
				};
			});
		});
	},
	/**
	 *
	 * @param lang
	 * @param title
	 * @param image
	 * @param text
	 * @return {Promise<any>}
	 */
	add(lang, title, image, text) {
		return new Promise((resolve, reject) => {
			let db;
			let item = Object.assign({}, this.Struct);
			Helper.Object.replaceMembers(item, {
				lang: lang,
				title: title,
				image: image,
				hash: Helper.Hash.md5(text),
				content: text
			});
			App.Idb.getDb().then((retDb) => {
				db = retDb;
				return this.getByHash(item.hash);
			}).then((foundBook) => {
				if (foundBook) {
					return foundBook;
				}
				return new Promise((resolve, reject) => {
					let transaction = db.transaction(['Books'], 'readwrite'); //readonly - для чтения
					let store = transaction.objectStore('Books');
					let req = store.put(item);
					req.onsuccess = (event) => {
						resolve({
							key: event.result,
							book: item
						});
					};
					req.onerror = (event) => {
						Helper.Log.addDebug(event);
						reject('Не удалось добавить книгу в БД.');
					};
				})
			}).then((result) => {
				resolve(result);
			}).catch((e) => {
				Helper.Log.addDebug(event);
				reject(e);
			})
		})
	}
};