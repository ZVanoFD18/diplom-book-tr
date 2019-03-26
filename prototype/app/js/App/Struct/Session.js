'use strict';
console.log('App.Struct.Session');

/**
 * @TODO: сессия для сохранения IDB. Позволяет восстановить читаемую книгу из хранилища.
 * @type {Object}
 */
App.Struct.Session = {
	bookHash: undefined,
	bookPosition: undefined
	// create: function () {
	// 	console.log('Session created');
	// }
};

// App.Struct.Session.__proto__ = {
// 	loadFromJson(jsonString) {
// 		let json = JSON.parse(jsonString);
// 		this.bookHash = json.bookHash;
// 		this.bookPosition = json.bookPosition;
// 	}
// };