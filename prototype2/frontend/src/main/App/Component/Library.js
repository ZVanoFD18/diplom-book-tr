'use strict';
import BooksList from './Library/BooksList'
import LoadFromFile from './Library/LoadFromFile'

import './Library.css';


let el = undefined;
let isDisplayed = false;

/**
 * Компонент "Библиотека".
 * Объединяет субкомпоненты для работы с библиотекой книг.
 */
export default class Library {
	static getEl() {
		return el;
	}

	static init() {
		el = document.getElementById('library');
		BooksList.init();
		LoadFromFile.init();
	}

	static display() {
		if (isDisplayed) {
//			return;
		}
		BooksList.loadAndDisplay().catch((e) => {
			document.Helper.Log.addDebug(e);
		});
		isDisplayed = true;
	}
};