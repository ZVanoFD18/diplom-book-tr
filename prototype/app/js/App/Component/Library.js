'use strict';
console.log('App.Component.Library');

/**
 * Компонент "Библиотека".
 * Объединяет субкомпоненты для работы с библтотекой книг.
 */
App.Component.Library = {
	init(){
		App.Component.Library.BooksList.init();
		App.Component.Library.LoadFromFile.init();
	}
};