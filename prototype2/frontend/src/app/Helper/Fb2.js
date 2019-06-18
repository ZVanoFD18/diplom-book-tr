'use strict';

import Helper from '../Helper';

export default class Fb2 {
	/**
	 * Формирует книгу из текста FB2.
	 * @param text
	 */
	static getBookFromText(text) {
		let tplBook = {
				lang: undefined,
				image: undefined,
				title: [],
				sections: []
			},
			tplBookSection = {
				title: [],
				p: []
			},
			book = Object.assign({}, tplBook);
		book.title = [];
		book.sections = [];
		let xml = Helper.Xml.getXMLFromString(text);
		let encoding = xml.xmlEncoding || xml.charset || xml.characterSet;
		encoding = (encoding || '').toLowerCase();
		if (encoding !== 'utf-8') {
			throw new Error('Кодировка книги не поддерживается.');
		}
		// console.log(xml);
		book.lang = xml.querySelector('description>title-info>lang').innerHTML;

		let headerTitle = xml.querySelector('description>title-info>book-title').innerHTML;
		if (headerTitle) {
			book.title.push(headerTitle);
		} else {
			xml.querySelectorAll('body>title>p').forEach((elP) => {
				book.title.push(elP.innerHTML);
			});
		}

		book.image = xml.querySelector('description>title-info>coverpage>image');
		if (!book.image) {
			book.image = xml.querySelector('body>image');
		}
		if (book.image) {
			book.image = getImage(book.image.getAttribute('l:href'));
		}

		function getImage(href) {
			let imageEl = xml.querySelector('binary[id="' + href.substr(1) + '"');
			if (imageEl) {
				return imageEl.innerHTML;
			}
			return undefined;
		}

		xml.querySelector('body').querySelectorAll('section').forEach((elSection) => {
			let section = Object.assign({}, tplBookSection);
			section.title = [];
			section.p = [];
			elSection.querySelector('title').querySelectorAll('p').forEach((elP) => {
				section.title.push(elP.innerHTML);
			});
			elSection.querySelectorAll('p').forEach((elP) => {
				let text = '';
				elP.childNodes.forEach((node) => {
					if (node.nodeType === 3) {
						text += node.textContent;
					}
				});
				section.p.push(text);
			});
			book.sections.push(section);
		});
		return book;
	}
};
