'use strict';
console.log('App.Component.Setlang');

/**
 * Компонент "Установка языка".
 * Позволяет установить родной и изучаемый языки.
 */
App.Component.Setlang = {
	el: undefined,

	elLangGui: undefined,
	elLangGuiTplOptions: undefined,

	elLangStudy: undefined,
	elLangStudyTplOptions: undefined,

	isDisplayed: false,
	init() {
		this.el = document.getElementById('setlang');

		this.elLangGui = this.el.querySelector('select[name="lang-gui"]');
		this.elLangGuiTplOptions = this.elLangGui.querySelector('option.tpl').cloneNode(true);

		this.elLangStudy = this.el.querySelector('select[name="lang-study"]');
		this.elLangStudyTplOptions = this.elLangStudy.querySelector('option.tpl').cloneNode(true);

		this.el.querySelector('.button-submit').addEventListener('click', this.onSubmit.bind(this));
	},
	display() {
		if (this.isDisplayed) {
			return;
		}
		this.elLangStudy.innerHTML = '';
		for (let lang in App.appEnv.languages) {

			let newElLangGui = this.elLangStudyTplOptions.cloneNode(true);
			newElLangGui.classList.remove('tpl');
			newElLangGui.value = lang;
			newElLangGui.innerHTML = App.appEnv.languages[lang];
			this.elLangGui.appendChild(newElLangGui);

			let newElLangStudy = this.elLangStudyTplOptions.cloneNode(true);
			newElLangStudy.classList.remove('tpl');
			newElLangStudy.value = lang;
			newElLangStudy.innerHTML = App.appEnv.languages[lang];
			this.elLangStudy.appendChild(newElLangStudy);

		}
		this.elLangGui.value = App.langGui;
		this.elLangStudy.value = App.langStudy;
		// App.Component.Setlang.BooksList.loadAndDisplay();
		this.isDisplayed = true;
	},
	onSubmit(event) {
		event.preventDefault();
		App.langGui = this.elLangGui.value;
		App.langStudy = this.elLangStudy.value;
		App.localizeGui();
		return App.Idb.KeyVal.LastSession.put({
			langGui: App.langGui,
			langStudy: App.langStudy,
			bookHash: undefined,
			bookPosition: undefined
		}).then(()=>{
			App.Component.Nav.go2section('library');
		})
	}
};