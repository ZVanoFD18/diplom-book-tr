'use strict';
console.log('App.Idb.KeyVal');

App.Idb.KeyVal = {
	/**
	 * Ключи, которыми помечаются записи в таблице.
	 */
	KEYS :{
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