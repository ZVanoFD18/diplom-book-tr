'use strict';
console.log('App.Component.Library');

/**
 * Компонент "Библиотека".
 * Объединяет субкомпоненты для работы с библиотекой книг.
 */
App.Component.Library = {
	el : undefined,
	isDisplayed : false,
	init(){
		this.el = document.getElementById('library');
		App.Component.Library.BooksList.init();
		App.Component.Library.LoadFromFile.init();
	},
	display(){
		if (this.isDisplayed){
//			return;
		}
		App.Component.Library.BooksList.loadAndDisplay();
		this.isDisplayed = true;
	}
};