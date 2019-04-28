'use strict';

import LastSession from './KeyVal/LastSession'

const stat = {
	/**
	 * Ключи, которыми помечаются записи в таблице.
	 */
	KEYS: {
		/**
		 * Элемент хранит информацию о последней сессии пользователя
		 */
		LAST_SESSION: 'KEY_LAST_SESSION'
	}
};

export default class KeyVal {
	static get LastSession() {
		return LastSession;
	}

	static get KEYS() {
		return stat.KEYS;
	}

	static get(key) {
		return new Promise((resolve, reject) => {
			document.App.Idb.getDb().then((db) => {
				let store = db.transaction(['KeyVal'], 'readonly').objectStore('KeyVal');
				let req = store.get(key);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject('Не удалось получить сессию из БД.');
				};
			})
		});
	}
};