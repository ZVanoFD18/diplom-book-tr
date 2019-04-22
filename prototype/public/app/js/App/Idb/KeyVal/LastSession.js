'use strict';

// app/js/App/Idb/KeyVal/LastSession.js
App.Idb.KeyVal.LastSession = {
	/**
	 * Структура, описывающая последнюю сессию пользователя.
	 */
	Struct: {
		/**
		 * Версия структуры на момент записи информации.
		 * @type {Number}
		 */
		version: 1,
		/**
		 * Язык пользовательского интерфейса (Напр. "ENG" или "RUS")
		 * @type {String}
		 */
		langGui: undefined,
		/**
		 * Изучаемый язык (Напр. "ENG" или "RUS")
		 * @type {String}
		 */
		langStudy: undefined,
		/**
		 * Идентификатор читаемой книги
		 * @type {String}
		 */
		bookHash: undefined,
		/**
		 * Позиция читаемой книги, на которой остановился пользователь
		 * @type {Number}
		 */
		bookPosition: undefined
	},
	get() {
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				let transaction = db.transaction(['KeyVal'], 'readwrite');
				let store = transaction.objectStore('KeyVal');
				let req = store.get(App.Idb.KeyVal.KEYS.LAST_SESSION);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject('Не удалось записать сессию в БД.');
				};
			});
		});
	},
	put(inpData) {
		return new Promise((resolve, reject) => {
			App.Idb.getDb().then((db) => {
				return db;
			}).then((db)=>{
				return new Promise((resolve, reject)=>{
					this.get().then((struct)=>{
						resolve({
							db : db,
							oldStruct : struct
						})
					});
				});
			}).then((data)=>{
				let newStruct;
				if(data.oldStruct){
					newStruct = data.oldStruct;
				} else{
					newStruct = Object.assign({}, this.Struct);
				}
				newStruct = Helper.Obj.replaceMembers(newStruct, inpData);
				let transaction = data.db.transaction(['KeyVal'], 'readwrite');
				let store = transaction.objectStore('KeyVal');
				let req = store.put(newStruct, App.Idb.KeyVal.KEYS.LAST_SESSION);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject(new App.Errors.User(App.localize('Не удалось записать сессию в БД.')));
				};
			});
		});
	}
};