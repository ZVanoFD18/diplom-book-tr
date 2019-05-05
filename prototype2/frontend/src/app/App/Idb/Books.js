'use strict';

import ErrorUser from '../Errors/User'

const stat = {
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
	}
};

export default class Books {

	/**
	 *
	 * @param hash
	 * @return {Promise<any>}
	 */
	static getByHash(hash) {
		let result = {
			key: undefined,
			book: undefined
		};
		return new Promise((resolve, reject) => {
			document.App.Idb.getDb().then((db) => {
				let transaction = db.transaction(['Books'], 'readonly'); //readonly - для чтения
				let store = transaction.objectStore('Books');
				let req = store.get(hash);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					document.Helper.Log.addDebug(event);
					reject(new ErrorUser(document.App.localize('Ошибка при поиске книги по хешу.')));
				};
			});
		});
	}

	/**
	 *
	 * @param lang
	 * @param title
	 * @param image
	 * @param text
	 * @return {Promise<any>}
	 */
	static add(lang, title, image, text) {
		return new Promise((resolve, reject) => {
			let db;
			let item = Object.assign({}, stat.Struct);
			item = document.Helper.Obj.replaceMembers(item, {
				lang: lang,
				title: title,
				image: image,
				hash: document.Helper.Hash.md5(text),
				content: text
			});
			document.App.Idb.getDb().then((retDb) => {
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
						resolve(item);
					};
					req.onerror = (event) => {
						document.Helper.Log.addDebug(event);
						reject(new ErrorUser(document.App.localize('Не удалось добавить книгу в БД.')));
					};
				})
			}).then((putResult) => {
				resolve(putResult);
			}).catch((e) => {
				document.Helper.Log.addDebug(event);
				reject(e);
			})
		})
	}

	static delete(bookHash){
		return new Promise((resolve, reject)=>{
			document.App.Idb.getDb().then((db) => {
				return db;
			}).then((db) => {
				let transaction = db.transaction(['Books'], 'readwrite'); //readonly - для чтения
				let store = transaction.objectStore('Books');
				let req = store.delete(bookHash);
				req.onsuccess = (event) => {
					resolve(bookHash);
				};
				req.onerror = (event) => {
					document.Helper.Log.addDebug(event);
					reject(new ErrorUser(document.App.localize('Не удалось удалить книгу из БД.')));
				};
			}).catch((e) => {
				document.Helper.Log.addDebug(event);
				reject(e);
			})
		});
	}

	static getAll(options) {
		options = options || {};
		options.filter = options.filter || {};
		if (document.Helper.isDefined(options.filter.lang)) {
			options.filter.lang = document.App.Idb.getNormalizedLang(options.filter.lang);
		}
		// options = document.Helper.Obj.replaceMembers({
		// 	lang : document.App.langStudy
		// },options);
		return new Promise((resolve, reject) => {
			let result = [];
			document.App.Idb.getDb().then((db) => {
				let store = db.transaction(['Books'], 'readonly').objectStore('Books');
				let req = store.openCursor();
				req.onsuccess = (event) => {
					let cursor = req.result;
					if (!cursor) {
						resolve(result);
						return;
					}
					if (document.Helper.isDefined(options.filter.lang)) {
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
