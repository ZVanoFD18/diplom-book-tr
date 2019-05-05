'use strict';
import './Menu.css';
import Helper from '../../Helper';
import ErrorApp from '../Errors/App';

/**
 * Компонент "Меню".
 */
export default class Menu {
	constructor(selector, callbackOnClick, elContext = undefined) {
		if (!Helper.isFunction(callbackOnClick)) {
			throw new ErrorApp('"callbackOnClick" - не задан');
		}
		this.callbackOnClick = callbackOnClick;
		this.elContext = elContext || undefined;
		this.el = [];
		if (Helper.isString(selector)) {
			let elements = document.querySelectorAll(el);
			if (elements.length < 1) {
				throw new ErrorApp('Меню не найдено');
			} else if (elements.length > 1) {
				throw new ErrorApp('Найдено более одного элемента меню');
			}
			this.el = elements[0];
		} else {
			this.el = selector;
		}
		this.el.addEventListener('click', this.onClick.bind(this));
		if (this.elContext) {
			this.elContext.addEventListener('click', this.elContext.bind(this));
		}
	}

	setContext(elContext) {
		this.elContext = elContext;
		return this;
	}

	onContextClick() {
		this.show();
	}

	onClick(e) {
		let menuItem = e.target.closest('.menu-item');
		if (menuItem) {
			this.callbackOnClick(menuItem, menuItem.getAttribute('data-menu-item-id'), this.elContext);
			this.hide();
		}
	}

	showAt(x, y) {
		this.el.style.left = x + 'px';
		this.el.style.top = y + 'px';
		this.el.classList.remove('hidden');
	}

	hide() {
		this.el.classList.add('hidden');
	}
}


