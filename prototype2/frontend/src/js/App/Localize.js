'use strict';
/**
 * Статические свойства класса, не поддерживаемые ES6.
 * @type {Object}
 */
const stat = {
	_loadedLang: {},
	_translates: {},
	_unknownTranslates: {}
};

export default class Localize {
	static load(lang) {
		try {
			if (!document.Helper.isDefined(lang)) {
				return false;
			}
			if (lang in stat._loadedLang && !stat._loadedLang[lang]) {
				return false;
			}
			if (lang in stat._translates) {
				return true;
			}
			let xhr = document.Helper.Ajax.getXhr();
			// Синхронный запрос т.к. перевод может потребоваться при объявлении объекта.
			xhr.open('GET', '/data/localize/' + lang + '.json', false);
			xhr.send();
			if (xhr.status != 200) {
				stat._loadedLang[lang] = false;
				return false;
			}
			let json = JSON.parse(xhr.responseText);
			stat._translates[lang] = json;
			stat._loadedLang[lang] = true;
			return true;
		} catch (e) {
			stat._loadedLang[lang] = false;
			return false;
		}
	}

	static get(text, lang) {
		if (!this.load(lang)) {
			return text;
		}
		if (text in stat._translates[lang]) {
			let translate = stat._translates[lang][text];
			if (document.Helper.isNull(translate)) {
				return text;
			} else {
				return translate;
			}
		}
		this.addUnknownTranslate(text, lang);
		return text;
	}

	static addUnknownTranslate(text, lang) {
		if (!(lang in stat._unknownTranslates)) {
			stat._unknownTranslates[lang] = {};
		}
		stat._unknownTranslates[lang][text] = "";
	}
};
