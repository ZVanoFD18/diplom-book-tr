'use strict';

import './Setlang.css';

/**
 * Контейнер для пвевдостатических полей.
 * @type {Object}
 */
const stat = {
	el: undefined,
	elLangGui: undefined,
	elLangGuiTplOptions: undefined,

	elLangStudy: undefined,
	elLangStudyTplOptions: undefined,

	isDisplayed: false
};


/**
 * Компонент "Установка языка".
 * Позволяет установить родной и изучаемый языки.
 */
export default class Setlang {
	static init() {
		stat.el = document.getElementById('setlang');

		stat.elLangGui = stat.el.querySelector('select[name="lang-gui"]');
		stat.elLangGuiTplOptions = stat.elLangGui.querySelector('option.tpl').cloneNode(true);
		stat.elLangGuiTplOptions.classList.remove('tpl');

		stat.elLangStudy = stat.el.querySelector('select[name="lang-study"]');
		stat.elLangStudyTplOptions = stat.elLangStudy.querySelector('option.tpl').cloneNode(true);
		stat.elLangStudyTplOptions.classList.remove('tpl');

		stat.el.querySelector('.button-submit').addEventListener('click', this.onSubmit.bind(this));
	}

	static display() {
		if (this.isDisplayed) {
			return;
		}
		stat.elLangGui.innerHTML = '';
		stat.elLangStudy.innerHTML = '';
		for (let lang in document.App.appEnv.languages) {
			let newElLangGui = stat.elLangStudyTplOptions.cloneNode(true);
			newElLangGui.value = lang;
			newElLangGui.innerHTML = document.App.appEnv.languages[lang];
			stat.elLangGui.appendChild(newElLangGui);

			let newElLangStudy = stat.elLangStudyTplOptions.cloneNode(true);
			newElLangStudy.value = lang;
			newElLangStudy.innerHTML = document.App.appEnv.languages[lang];
			stat.elLangStudy.appendChild(newElLangStudy);
		}
		stat.elLangGui.value = document.App.langGui;
		stat.elLangStudy.value = document.App.langStudy;
		// document.App.Component.Setlang.BooksList.loadAndDisplay();
		this.isDisplayed = true;
	}

	static onSubmit(event) {
		event.preventDefault();
		document.App.langGui = stat.elLangGui.value;
		document.App.langStudy = stat.elLangStudy.value;
		document.App.localizeGui();
		return document.App.Idb.KeyVal.LastSession.put({
			langGui: document.App.langGui,
			langStudy: document.App.langStudy,
			bookHash: undefined,
			bookPosition: undefined
		}).then(() => {
			document.App.Component.Nav.go2section('library');
		})
	}
};
