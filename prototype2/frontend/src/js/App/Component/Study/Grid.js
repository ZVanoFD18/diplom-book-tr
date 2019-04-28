'use strict';

let elTbody = undefined;
let elTplTr = undefined;
let rowStruct = {
	word: undefined,
	translate: undefined,
	isStudy: undefined
};
/**
 * Слова, на текущей странице таблицы
 */
let rows = [];
/**
 * Количество слов, отображаемое на странице за раз
 */
let countPerPage = 15;
let currentPage = 1;
let totalPages = 0;
let elGrid = undefined;

/**
 * Компонент "Таблица слов"
 **/
export default class Grid {
	static init(elGrid) {
		elGrid = elGrid;
		elGrid.querySelector('.study-bbar-btn-next').addEventListener('click', this.onBbarBtnNextClick.bind(this));
		elGrid.querySelector('.study-bbar-btn-prev').addEventListener('click', this.onBbarBtnPrevClick.bind(this));
		elGrid.querySelector('.study-bbar-gotopage-button').addEventListener('click', this.onBbarBtnGotopageClick.bind(this));
		elTbody = elGrid.querySelector('table>tbody');
		elTplTr = elTbody.querySelector('tr.tpl');
		elTplTr.classList.remove('tpl');
	}

	static _loadData() {
		return new Promise((resolve, reject) => {
			 document.App.Idb.WordsStudy.getCountForLang( document.App.langStudy).then((result) => {
				totalPages = Math.ceil(result / countPerPage);
			}).then(() => {
				return this._loadDataTable();
			}).then(() => {
				resolve();
			});
		})
	}

	static onBbarBtnNextClick(e) {
		if (currentPage >= totalPages) {
			return;
		}
		++currentPage;
		this._loadDataTable().then(() => {
			this.display();
		});
	}

	static _loadDataTable() {
		rows = [];
		return new Promise((resolve, reject) => {
			 document.App.Idb.WordsStudy.getAllAsObject( document.App.langStudy, {
				from: (currentPage - 1) * countPerPage,
				to: currentPage * countPerPage - 1
			}).then((words) => {
				let wordsList = [];
				for (let word in words) {
					wordsList.push(word);
					let newRow = Object.assign({}, rowStruct);
					newRow.word = word;
					newRow.isStudy = words[word].isStudy;
					rows.push(newRow);
				}
				return document.App.getWordsTranslate(wordsList);
			}).then((translates) => {
				translates.forEach((translateStruct) => {
					let rowRef = document.Helper.Obj.getObjectFromArray(rows, 'word', translateStruct.word);
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
		if (currentPage <= 1) {
			return;
		}
		--currentPage;
		this._loadDataTable().then(() => {
			this.display();
		});
	}

	static onBbarBtnGotopageClick(e) {
		let pageIndex = elGrid.querySelector('.study-bbar-gotopage-value').value;
		pageIndex = parseInt(pageIndex);
		if (!document.Helper.isNumber(pageIndex) || pageIndex < 1 || pageIndex > totalPages) {
			 document.App.Component.WinMsg.show({
				title: document.App.localize('Уведомление'),
				message: document.App.localize('Номер страницы вне допустимого диапазона')
			});
			return;
		}
		let lastPage = currentPage;
		currentPage = pageIndex;
		this.reload().then(() => {
			this.display();
		}).catch(() => {
			currentPage = lastPage;
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
		elGrid.querySelector('.study-bbar-page-value').innerHTML = currentPage;
		elGrid.querySelector('.study-bbar-page-total-value').innerHTML = totalPages;
		elTbody.innerHTML = '';
		let addRow = (row) => {
			let elTr = elTplTr.cloneNode(true);
			elTr.classList.remove('tpl');
			elTr.querySelector('.study-td-index').innerHTML = (currentPage - 1) * countPerPage + cnrWord + 1;
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
			elTbody.appendChild(elTr);
		};
		let cnrWord = 0;
		rows.forEach((row) => {
			addRow(row);
			++cnrWord;
		});
		for (; cnrWord < countPerPage; ++cnrWord) {
			addRow();
		}
	}
};
