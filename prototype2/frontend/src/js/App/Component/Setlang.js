'use strict';

let el= undefined;

let elLangGui= undefined;
let elLangGuiTplOptions = undefined;

let elLangStudy = undefined;
let elLangStudyTplOptions = undefined;

let isDisplayed = false;

/**
 * Компонент "Установка языка".
 * Позволяет установить родной и изучаемый языки.
 */
export default class Setlang {
	static init() {
		el = document.getElementById('setlang');

		elLangGui = el.querySelector('select[name="lang-gui"]');
		elLangGuiTplOptions = elLangGui.querySelector('option.tpl').cloneNode(true);
		elLangGuiTplOptions.classList.remove('tpl');

		elLangStudy = el.querySelector('select[name="lang-study"]');
		elLangStudyTplOptions = elLangStudy.querySelector('option.tpl').cloneNode(true);
		elLangStudyTplOptions.classList.remove('tpl');

		el.querySelector('.button-submit').addEventListener('click', this.onSubmit.bind(this));
	}
	static display() {
		if (this.isDisplayed) {
			return;
		}
		elLangGui.innerHTML = '';
		elLangStudy.innerHTML = '';
		for (let lang in document.App.appEnv.languages) {
			let newElLangGui = elLangStudyTplOptions.cloneNode(true);
			newElLangGui.value = lang;
			newElLangGui.innerHTML = document.App.appEnv.languages[lang];
			elLangGui.appendChild(newElLangGui);

			let newElLangStudy = elLangStudyTplOptions.cloneNode(true);
			newElLangStudy.value = lang;
			newElLangStudy.innerHTML = document.App.appEnv.languages[lang];
			elLangStudy.appendChild(newElLangStudy);
		}
		elLangGui.value = document.App.langGui;
		elLangStudy.value = document.App.langStudy;
		// document.App.Component.Setlang.BooksList.loadAndDisplay();
		this.isDisplayed = true;
	}
	static onSubmit(event) {
		event.preventDefault();
		 document.App.langGui = elLangGui.value;
		 document.App.langStudy = elLangStudy.value;
		 document.App.localizeGui();
		return document.App.Idb.KeyVal.LastSession.put({
			langGui: document.App.langGui,
			langStudy: document.App.langStudy,
			bookHash: undefined,
			bookPosition: undefined
		}).then(()=>{
			 document.App.Component.Nav.go2section('library');
		})
	}
};
