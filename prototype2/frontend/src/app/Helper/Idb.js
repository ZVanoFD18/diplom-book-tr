'use strict';
/**
 * Idb- IndexedDB
 * @type {{}}
 */
export default class Idb {
	/**
	 * Проверяет существует ли БД.
	 * @note: не работает в IE11
	 * @param dbName
	 * @param callback
	 */
	static isDbExists(dbName) {
		return new Promise(function (resolve, reject) {
			var db = indexedDB,
				req;
			try {
				// See if it exist
				req = db.webkitGetDatabaseNames();
				req.onsuccess = function (evt) {
					~([].slice.call(evt.target.result)).indexOf(dbName) ?
						resolve(true) :
						reject(false);
				}
			} catch (e) {
				// Try if it exist
				req = db.open(dbName);
				req.onsuccess = function () {
					req.result.close();
					resolve(true);
				};
				req.onupgradeneeded = function (evt) {
					evt.target.transaction.abort();
					reject(false);
				}
			}
		});
	}
};

