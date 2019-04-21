'use strict';
console.log('App.Localize');

App.Localize = {
	_loadedLang: {},
	_translates: {},
	_unknownTranslates: {},
	load(lang) {
		try {
			if (!Helper.isDefined(lang)) {
				return false;
			}
			if (lang in this._loadedLang && !this._loadedLang[lang]) {
				return false;
			}
			if (lang in this._translates) {
				return true;
			}
			let xhr = Helper.Ajax.getXhr();
			// Синхронный запрос т.к. перевод может потребоваться при объявлении объекта.
			xhr.open('GET', '/resources/localize/' + lang + '.json', false);
			xhr.send();
			if (xhr.status != 200) {
				this._loadedLang[lang] = false;
				return false;
			}
			let json = JSON.parse(xhr.responseText);
			this._translates[lang] = json;
			this._loadedLang[lang] = true;
			return true;
		} catch (e) {
			this._loadedLang[lang] = false;
			return false;
		}
	},
	get(text, lang) {
		if (!this.load(lang)) {
			return text;
		}
		if (text in this._translates[lang]) {
			let translate = this._translates[lang][text];
			if (Helper.isNull(translate)){
				return text;
			} else {
				return translate;
			}
		}
		this.addUnknownTranslate(text, lang);
		return text;
	},
	addUnknownTranslate(text, lang) {
		if (!(lang in this._unknownTranslates)) {
			this._unknownTranslates[lang] = {};
		}
		this._unknownTranslates[lang][text] = "";
		console.log('translateMe/' + lang + '/', text);
	}
};
