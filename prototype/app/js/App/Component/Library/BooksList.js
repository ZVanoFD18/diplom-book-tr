'use strict';
console.log('App.Component.Library.BooksList');

/**
 * Компонент, позволяющий выбрать книгу из БД.
 */
App.Component.Library.BooksList = {
	el: undefined,
	/**
	 * @type {Array}
	 * @see App.Idb.Books.Struct
	 *
	 */
	books: [],
	init() {
		this.el = App.Component.Library.el.querySelector('.library-books-list');
		this.el.addEventListener('click', this.onListClick.bind(this))
	},
	_load() {
		return new Promise((resolve, reject) => {
			this.books = [];
			App.Idb.Books.getAll({
				filter: {
					lang: App.langStudy
				}
			}).then((books) => {
				this.books = books;
				resolve();
			}).catch((e) => {
				reject(new App.Errors.User(App.localize('Не удалось загрузить список книг из БД')));
			})
		});
	},
	display() {
		this.clean();
		let elTplItem = this.el.querySelector('.tpl.library-books-item');
		this.books.forEach((book) => {
			let newItem = elTplItem.cloneNode(true);
			newItem.classList.remove('tpl');
			newItem.querySelector('.library-books-hash').innerHTML = book.hash;
			newItem.querySelector('.library-books-lang-value').innerHTML = book.lang;
			newItem.querySelector('.library-books-title').innerHTML = book.title.concat('<br>');
			let img = book.image;
			if (img) {
				newItem.querySelector('.library-books-image img').src = 'data:image/;base64,' + img;
			}
			this.el.appendChild(newItem);
		});
	},
	clean(){
		let elList = this.el.querySelectorAll('.library-books-item:not(.tpl)');
		elList.forEach((el)=>{
			this.el.removeChild(el);
		})
	},
	loadAndDisplay() {
		return new Promise((resolve, reject) => {
			this._load().then(() => {
				this.display();
				resolve();
			}).catch((e) => {
				reject();
			});
		});
	},
	onListClick(event) {
		let itemEl = event.target.closest('.library-books-item');
		if (!itemEl) {
			return;
		}
		itemEl.classList.add('active');
		setTimeout(() => {
			itemEl.classList.remove('active');
		}, 2000);
		App.bookToReadByHash(itemEl.querySelector('.library-books-hash').innerHTML);
	}
};