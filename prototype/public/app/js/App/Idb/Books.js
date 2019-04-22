'use strict';

// app/js/App/Idb/Books.js
App.Idb.Books = {
	/**
	 * Структура, описывающая хранимую книгу
	 */
	Struct: {
		/**
		 * Версия структуры на момент записи книги
		 * @type {Number}
		 */
		version: 1,
		/**
		 * Язык книги (Напр. "ENG" или "RUS")
		 * @type {String}
		 */
		lang: undefined,
		/**
		 * Заглавие книги на языке книги.
		 */
		title: undefined,
		/**
		 * BASE64-кодированное изображение титульной страницы.
		 * @type {String}
		 */
		image: undefined,
		/**
		 * MD5-хеш контента книги
		 * @type {String}
		 */
		hash: undefined,
		/**
		 * Контент FB2-книги
		 * @type {String}
		 */
		content: undefined
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
				let req = store.get(hash);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					Helper.Log.addDebug(event);
					reject(new App.Errors.User(App.localize('Ошибка при поиске книги по хешу.')));
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
			item = Helper.Obj.replaceMembers(item, {
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
							key: req.result,
							book: item
						});
					};
					req.onerror = (event) => {
						Helper.Log.addDebug(event);
						reject(new App.Errors.User(App.localize('Не удалось добавить книгу в БД.')));
					};
					// @TODO: удалить блок после исследования.
					transaction.oncomplete = function (e) {
						console.log('App.Idb.Books.add/transaction.oncomplete', e);
						db.close();
					};
				})
			}).then((putResult) => {
				resolve(putResult);
			}).catch((e) => {
				Helper.Log.addDebug(event);
				reject(e);
			})
		})
	},
	getAll(options) {
		options = options || {};
		options.filter = options.filter || {};
		if (Helper.isDefined(options.filter.lang)){
			options.filter.lang = App.Idb.getNormalizedLang(options.filter.lang);
		}
		// options = Helper.Obj.replaceMembers({
		// 	lang : App.langStudy
		// },options);
		return new Promise((resolve, reject) => {
			let result = [];
			App.Idb.getDb().then((db) => {
				let store = db.transaction(['Books'], 'readonly').objectStore('Books');
				let req = store.openCursor();
				req.onsuccess = (event) => {
					let cursor = req.result;
					if (!cursor) {
						resolve(result);
						return;
					}
					if (Helper.isDefined(options.filter.lang)) {
						if (options.filter.lang === cursor.value.lang) {
							result.push(cursor.value);
						}
					} else {
						result.push(cursor.value);
					}
					cursor.continue()
				}
			});
		});
	}
};