'use strict';

import './Grid.css';

/**
 * Псевдостатические свойства.
 * @type {Object}
 */
const stat = {
	elTbody: undefined,
	elTplTr: undefined,
	rowStruct: {
		word: undefined,
		translate: undefined,
		isStudy: undefined
	},
	/**
	 * Слова, на текущей странице таблицы
	 */
	rows: [],
	/**
	 * Количество слов, отображаемое на странице за раз
	 */
	countPerPage: 15,
	currentPage: 1,
	totalPages: 0,
	elGrid: undefined
};
/**
 * Компонент "Таблица слов"
 **/
export default class Grid {
	static init(elGrid) {
		stat.elGrid = elGrid;
		stat.elGrid.querySelector('.study-bbar-btn-next').addEventListener('click', this.onBbarBtnNextClick.bind(this));
		stat.elGrid.querySelector('.study-bbar-btn-prev').addEventListener('click', this.onBbarBtnPrevClick.bind(this));
		stat.elGrid.querySelector('.study-bbar-gotopage-button').addEventListener('click', this.onBbarBtnGotopageClick.bind(this));
		stat.elTbody = stat.elGrid.querySelector('table>tbody');
		stat.elTplTr = stat.elTbody.querySelector('tr.tpl');
		stat.elTplTr.classList.remove('tpl');
	}

	static _loadData() {
		return new Promise((resolve, reject) => {
			document.App.Idb.WordsStudy.getCountForLang(document.App.langStudy).then((result) => {
				stat.totalPages = Math.ceil(result / stat.countPerPage);
			}).then(() => {
				return this._loadDataTable();
			}).then(() => {
				resolve();
			});
		})
	}

	static onBbarBtnNextClick(e) {
		if (stat.currentPage >= stat.totalPages) {
			return;
		}
		++stat.currentPage;
		this._loadDataTable().then(() => {
			this.display();
		});
	}

	static _loadDataTable() {
		stat.rows = [];
		return new Promise((resolve, reject) => {
			document.App.Idb.WordsStudy.getAllAsObject(document.App.langStudy, {
				from: (stat.currentPage - 1) * stat.countPerPage,
				to: stat.currentPage * stat.countPerPage - 1
			}).then((words) => {
				let wordsList = [];
				for (let word in words) {
					wordsList.push(word);
					let newRow = Object.assign({}, stat.rowStruct);
					newRow.word = word;
					newRow.isStudy = words[word].isStudy;
					stat.rows.push(newRow);
				}
				return document.App.getWordsTranslate(wordsList);
			}).then((translates) => {
				translates.forEach((translateStruct) => {
					let rowRef = document.Helper.Obj.getObjectFromArray(stat.rows, 'word', translateStruct.word);
					rowRef.translate = translateStruct.translate;
				});
				resolve();
			}).catch((e) => {
				document.Helper.Log.addDebug(e);
				reject(e);
			});
		});
	}

	static onBbarBtnPrevClick(e) {
		if (stat.currentPage <= 1) {
			return;
		}
		--stat.currentPage;
		this._loadDataTable().then(() => {
			this.display();
		});
	}

	static onBbarBtnGotopageClick(e) {
		let pageIndex = stat.elGrid.querySelector('.study-bbar-gotopage-value').value;
		pageIndex = parseInt(pageIndex);
		if (!document.Helper.isNumber(pageIndex) || pageIndex < 1 || pageIndex > stat.totalPages) {
			document.App.Component.WinMsg.show({
				title: document.App.localize('Уведомление'),
				message: document.App.localize('Номер страницы вне допустимого диапазона')
			});
			return;
		}
		let lastPage = stat.currentPage;
		stat.currentPage = pageIndex;
		this.reload().then(() => {
			this.display();
		}).catch(() => {
			stat.currentPage = lastPage;
		})
	}

	static reload() {
		return new Promise((resolve, reject) => {
			this._loadData().then(() => {
				this.display();
				resolve();
			}).catch(() => {
				reject();
			});
		})
	}

	static display() {
		stat.elGrid.querySelector('.study-bbar-page-value').innerHTML = stat.currentPage;
		stat.elGrid.querySelector('.study-bbar-page-total-value').innerHTML = stat.totalPages;
		stat.elTbody.innerHTML = '';
		let addRow = (row) => {
			let elTr = stat.elTplTr.cloneNode(true);
			elTr.classList.remove('tpl');
			elTr.querySelector('.study-td-index').innerHTML = (stat.currentPage - 1) * stat.countPerPage + cnrWord + 1;
			if (!document.Helper.isObject(row)) {
				elTr.classList.add('empty');
			} else {
				elTr.querySelector('.study-td-word').innerHTML = row.word;
				elTr.querySelector('.study-td-translate').innerHTML = row.translate;
				let elIsStudy = elTr.querySelector('.study-td-is-study>i');
				if (row.isStudy === document.App.Idb.TRUE) {
					elIsStudy.classList.add('fas');
					elIsStudy.classList.add('fa-plus-circle');
					elIsStudy.classList.add('is-study-true');
				} else {
					elIsStudy.classList.add('fas');
					elIsStudy.classList.add('fa-minus-circle');
					elIsStudy.classList.add('is-study-false');
				}
			}
			stat.elTbody.appendChild(elTr);
		};
		let cnrWord = 0;
		stat.rows.forEach((row) => {
			addRow(row);
			++cnrWord;
		});
		for (; cnrWord < stat.countPerPage; ++cnrWord) {
			addRow();
		}
	}
};
