'use strict';
import Library from '../Library';
let el= undefined;
let	elTplItem = undefined;
/**
 * @type {Array}
 * @see document.App.Idb.Books.Struct
 *
 */
let books= [];

/**
 * Компонент, позволяющий выбрать книгу из БД.
 */
export default class BooksList  {
	static init() {
		el = Library.getEl().querySelector('.library-books-list');
		el.addEventListener('click', this.onListClick.bind(this))
		elTplItem = el.querySelector('.tpl.library-books-item');
		elTplItem.classList.remove('tpl');
	}
	static _load() {
		return new Promise((resolve, reject) => {
			this.books = [];
			 document.App.Idb.Books.getAll({
				filter: {
					lang: document.App.langStudy
				}
			}).then((books) => {
				this.books = books;
				resolve();
			}).catch((e) => {
				reject(new document.App.Errors.User( document.App.localize('Не удалось загрузить список книг из БД')));
			})
		});
	}
	static display() {
		this.clean();
		this.books.forEach((book) => {
			let newItem = elTplItem.cloneNode(true);
			newItem.querySelector('.library-books-hash').innerHTML = book.hash;
			newItem.querySelector('.library-books-lang-value').innerHTML = book.lang;
			newItem.querySelector('.library-books-title').innerHTML = book.title.concat('<br>');
			let img = book.image;
			if (img) {
				newItem.querySelector('.library-books-image img').src = 'data:image/;base64,' + img;
			}
			el.appendChild(newItem);
		});
	}
	static clean() {
		let elList = el.querySelectorAll('.library-books-item');
		elList.forEach((el) => {
			el.removeChild(el);
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
				message: (e instanceof document.App.Errors.User) ? e.message : document.App.localize('Ошибка при попытке загрузить книгу из библиотеки')
			});
		});
	}
};