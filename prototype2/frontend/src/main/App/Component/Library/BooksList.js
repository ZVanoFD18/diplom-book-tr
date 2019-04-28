'use strict';
import Library from '../Library';

import ErrorUser from '../../Errors/User'

const stat = {
	el: undefined,
	elTplItem: undefined,
	/**
	 * @type {Array}
	 * @see document.App.Idb.Books.Struct
	 *
	 */
	books: []
};
/**
 * Компонент, позволяющий выбрать книгу из БД.
 */
export default class BooksList {
	static init() {
		stat.el = Library.getEl().querySelector('.library-books-list');
		stat.el.addEventListener('click', this.onListClick.bind(this))
		stat.elTplItem = stat.el.querySelector('.tpl.library-books-item');
		stat.elTplItem.classList.remove('tpl');
	}

	static _load() {
		return new Promise((resolve, reject) => {
			stat.books = [];
			document.App.Idb.Books.getAll({
				filter: {
					lang: document.App.langStudy
				}
			}).then((books) => {
				stat.books = books;
				resolve();
			}).catch((e) => {
				reject(new ErrorUser(document.App.localize('Не удалось загрузить список книг из БД')));
			})
		});
	}

	static display() {
		this.clean();
		stat.books.forEach((book) => {
			let newItem = stat.elTplItem.cloneNode(true);
			newItem.querySelector('.library-books-hash').innerHTML = book.hash;
			newItem.querySelector('.library-books-lang-value').innerHTML = book.lang;
			newItem.querySelector('.library-books-title').innerHTML = book.title.concat('<br>');
			let img = book.image;
			if (img) {
				newItem.querySelector('.library-books-image img').src = 'data:image/;base64,' + img;
			}
			stat.el.appendChild(newItem);
		});
	}

	static clean() {
		let elList = stat.el.querySelectorAll('.library-books-item');
		elList.forEach((el) => {
			stat.el.removeChild(el);
		})
	}

	static loadAndDisplay() {
		return new Promise((resolve, reject) => {
			this._load().then(() => {
				this.display();
				resolve();
			}).catch((e) => {
				reject();
			});
		});
	}

	static onListClick(event) {
		let itemEl = event.target.closest('.library-books-item');
		if (!itemEl) {
			return;
		}
		itemEl.classList.add('active');
		setTimeout(() => {
			itemEl.classList.remove('active');
		}, 2000);
		document.App.bookToReadByHash(itemEl.querySelector('.library-books-hash').innerHTML).then(() => {
			document.App.Component.Nav.go2section('read');
		}).catch((e) => {
			document.App.Component.WinMsg.show({
				title: document.App.localize('Уведомление.'),
				message: (e instanceof ErrorUser) ? e.message : document.App.localize('Ошибка при попытке загрузить книгу из библиотеки')
			});
		});
	}
};