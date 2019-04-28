'use strict';

const stat ={
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
	}
};
export default class LastSession {
	static get Struct(){
		return stat.Struct;
	}
	static get() {
		return new Promise((resolve, reject) => {
			 document.App.Idb.getDb().then((db) => {
				let transaction = db.transaction(['KeyVal'], 'readwrite');
				let store = transaction.objectStore('KeyVal');
				let req = store.get( document.App.Idb.KeyVal.KEYS.LAST_SESSION);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject('Не удалось записать сессию в БД.');
				};
			});
		});
	}
	static put(inpData) {
		return new Promise((resolve, reject) => {
			 document.App.Idb.getDb().then((db) => {
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
				newStruct = document.Helper.Obj.replaceMembers(newStruct, inpData);
				let transaction = data.db.transaction(['KeyVal'], 'readwrite');
				let store = transaction.objectStore('KeyVal');
				let req = store.put(newStruct, document.App.Idb.KeyVal.KEYS.LAST_SESSION);
				req.onsuccess = (event) => {
					resolve(req.result);
				};
				req.onerror = (event) => {
					reject(new document.App.Errors.User( document.App.localize('Не удалось записать сессию в БД.')));
				};
			});
		});
	}
};