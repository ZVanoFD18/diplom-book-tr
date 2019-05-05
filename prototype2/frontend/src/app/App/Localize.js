'use strict';
import Helper from '../Helper';

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
	/**
	 * Загружает перевод с сервера, если требуется
	 * @param lang
	 * @return {boolean}
	 */
	static load(lang) {
		try {
			if (!Helper.isDefined(lang)) {
				return false;
			}
			if (lang in stat._loadedLang && !stat._loadedLang[lang]) {
				return false;
			}
			if (lang in stat._translates) {
				return true;
			}
			let xhr = Helper.Ajax.getXhr();
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

	/**
	 * Возвращает перевод для ключевой фразы
	 * @param {String} text - ключевая фраза(первичный текст для перевода)
	 * @param {String} lang - Язык, для которого запрошен перевод (т.е. на выходе должна быть фраза для этого языка).
	 * @return {*}
	 */
	static get(text, lang) {
		if (!this.load(lang)) {
			this.addUnknownTranslate(text, lang);
			return text;
		}
		if (text in stat._translates[lang]) {
			let translate = stat._translates[lang][text];
			if (Helper.isNull(translate)) {
				return text;
			} else {
				return translate;
			}
		}
		this.addUnknownTranslate(text, lang);
		return text;
	}

	/**
	 * Добавляет ключевую фразу в список не переведенных.
	 * @TODO: реализовать выгрузку на сервер и сигнал администратору сайта.
	 * @param text
	 * @param lang
	 */
	static addUnknownTranslate(text, lang) {
		if (!(lang in stat._unknownTranslates)) {
			stat._unknownTranslates[lang] = {};
		}
		stat._unknownTranslates[lang][text] = "";
		console.log('translateMe/' + lang + '/', text);
	}
};
