'use strict';

// app/js/App/Idb/KeyVal/LastSession.js
App.Idb.KeyVal = {
	/**
	 * Ключи, которыми помечаются записи в таблице.
	 */
	KEYS :{
		/**
		 * Элемент хранит информацию о последней сессии пользователя
		 */
		LAST_SESSION : 'KEY_LAST_SESSION'
	},
	get(key) {
		return new Promise((resolve, reject)=>{
			App.Idb.getDb().then((db) => {
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