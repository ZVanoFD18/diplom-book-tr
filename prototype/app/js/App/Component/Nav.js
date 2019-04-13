'use strict';
console.log('App.Component.Nav');

/**
 * Раздел секции "Статистика"
 */
App.Component.Nav = {
	/**
	 * Ссылка на DOM-элемент "Навигация"
	 */
	elNav : undefined,
	/**
	 * Ссылка на DOM-элемент "Иконка еавигации".
	 */
	elNavIcon : undefined,
	init(){
		this.elNav = document.querySelector('nav.nav');
		this.elNavIcon = document.querySelector('.nav-icon');
		// Обработчики навигации
		this.elNavIcon.addEventListener('click', this.onNavIconClick.bind(this));
		this.elNav.addEventListener('click', this.onNavClick.bind(this));
	},
	/**
	 * Клик по иконке "Меню".
	 * По этому действию нужно отобразить меню.
	 * @param event
	 */
	onNavIconClick(event) {
		this.elNav.classList.toggle('hidden');
	},
	/**
	 * Обработчик нажатия на элемент навигации.
	 * Если кликнули на ссылку, то выполняет переход к выбранному блоку и скрывает меню.
	 * @param event
	 */
	onNavClick(event) {
		let href = event.target.getAttribute('href');
		if (href === null) {
			return;
		}
		this.go2section(href.substr(1));
		this.elNav.classList.toggle('hidden');
	},
	/**
	 * Выполняет навигацию к указанной секции.
	 * @param sectionId
	 */
	go2section(sectionId) {
		App.Component.Loadmask.show('Навигация...');
		setTimeout(() => {
			document.getElementById('content').querySelectorAll('section').forEach((elSection) => {
				elSection.classList.add('hidden');
			});
			document.getElementById(sectionId).classList.remove('hidden');
			document.getElementById(sectionId).scrollIntoView();
			App.Component.Loadmask.hide();
			switch (sectionId) {
				case 'study' :
					App.Component.Study.display();
					break;
				case 'library' :
					App.Component.Library.display();
					break;
			}
		}, 50);
	}
};