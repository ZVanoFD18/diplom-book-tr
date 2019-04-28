'use strict';

import './Nav.css';

// import Component from '../Component';

/**
 * Ссылка на DOM-элемент "Навигация"
 */
let elNav = undefined;
	/**
	 * Ссылка на DOM-элемент "Иконка еавигации".
	 */
let elNavIcon = undefined;

/**
 * Раздел секции "Статистика"
 */
export default class Nav {
	static init(){
		elNav = document.querySelector('nav.nav');
		elNavIcon = document.querySelector('.nav-icon');
		// Обработчики навигации
		elNavIcon.addEventListener('click', this.onNavIconClick.bind(this));
		elNav.addEventListener('click', this.onNavClick.bind(this));
	}
	/**
	 * Клик по иконке "Меню".
	 * По этому действию нужно отобразить меню.
	 * @param event
	 */
	static onNavIconClick(event) {
		elNav.classList.toggle('hidden');
	}
	/**
	 * Обработчик нажатия на элемент навигации.
	 * Если кликнули на ссылку, то выполняет переход к выбранному блоку и скрывает меню.
	 * @param event
	 */
	static onNavClick(event) {
		let href = event.target.getAttribute('href');
		if (href === null) {
			return;
		}
		this.go2section(href.substr(1));
		elNav.classList.toggle('hidden');
	}
	/**
	 * Выполняет навигацию к указанной секции.
	 * @param sectionId
	 */
	static go2section(sectionId) {
		document.App.Component.Loadmask.show(document.App.localize('Навигация...'));
		setTimeout(() => {
			document.getElementById('content').querySelectorAll('section').forEach((elSection) => {
				elSection.classList.add('hidden');
			});
			document.getElementById(sectionId).classList.remove('hidden');
			document.getElementById(sectionId).scrollIntoView();
			document.App.Component.Loadmask.hide();
			switch (sectionId) {
				case 'setlang' :
					document.App.Component.Setlang.display();
					break;
				case 'study' :
					document.App.Component.Study.display();
					break;
				case 'library' :
					document.App.Component.Library.display();
					break;
			}
		}, 50);
	}
};