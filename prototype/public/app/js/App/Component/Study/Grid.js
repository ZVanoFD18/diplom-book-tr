'use strict';
console.log('App.Component.Study.Table');

/**
 * Компонент "Таблица слов"
 **/
App.Component.Study.Grid = {
	elTbody : undefined,
	elTplTr : undefined,
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
	elGrid: undefined,
	init(elGrid) {
		this.elGrid = elGrid;
		this.elGrid.querySelector('.study-bbar-btn-next').addEventListener('click', this.onBbarBtnNextClick.bind(this));
		this.elGrid.querySelector('.study-bbar-btn-prev').addEventListener('click', this.onBbarBtnPrevClick.bind(this));
		this.elGrid.querySelector('.study-bbar-gotopage-button').addEventListener('click', this.onBbarBtnGotopageClick.bind(this));
		this.elTbody = this.elGrid.querySelector('table>tbody');
		this.elTplTr = this.elTbody.querySelector('tr.tpl');
		this.elTplTr.classList.remove('tpl');
	},
	_loadData() {
		return new Promise((resolve, reject) => {
			App.Idb.WordsStudy.getCountForLang(App.langStudy).then((result) => {
				this.totalPages = Math.ceil(result / this.countPerPage);
			}).then(() => {
				return this._loadDataTable();
			}).then(() => {
				resolve();
			});
		})
	},
	_loadDataTable() {
		this.rows = [];
		return new Promise((resolve, reject) => {
			App.Idb.WordsStudy.getAllAsObject(App.langStudy, {
				from: (this.currentPage - 1) * this.countPerPage,
				to: this.currentPage * this.countPerPage - 1
			}).then((words) => {
				let wordsList = [];
				for (let word in words) {
					wordsList.push(word);
					let newRow = Object.assign({}, this.rowStruct);
					newRow.word = word;
					newRow.isStudy = words[word].isStudy;
					this.rows.push(newRow);
				}
				return App.getWordsTranslate(wordsList);
			}).then((translates) => {
				translates.forEach((translateStruct) => {
					let rowRef = Helper.Obj.getObjectFromArray(this.rows, 'word', translateStruct.word);
					rowRef.translate = translateStruct.translate;
				});
				resolve();
			}).catch((e) => {
				Helper.Log.addDebug(e);
				reject(e);
			});
		});
	},
	onBbarBtnNextClick(e) {
		if (this.currentPage >= this.totalPages) {
			return;
		}
		++this.currentPage;
		this._loadDataTable().then(() => {
			this.display();
		});
	},
	onBbarBtnPrevClick(e) {
		if (this.currentPage <= 1) {
			return;
		}
		--this.currentPage;
		this._loadDataTable().then(() => {
			this.display();
		});
	},
	onBbarBtnGotopageClick(e) {
		let pageIndex = this.elGrid.querySelector('.study-bbar-gotopage-value').value;
		pageIndex = parseInt(pageIndex);
		if (!Helper.isNumber(pageIndex) || pageIndex < 1 || pageIndex > this.totalPages) {
			App.Component.WinMsg.show({
				title: App.localize('Уведомление'),
				message: App.localize('Номер страницы вне допустимого диапазона')
			});
			return;
		}
		let lastPage = this.currentPage;
		this.currentPage = pageIndex;
		this.reload().then(()=>{
			this.display();
		}).catch(()=>{
			this.currentPage = lastPage;
		})
	},
	reload() {
		return new Promise((resolve, reject) => {
			this._loadData().then(() => {
				this.display();
				resolve();
			}).catch(() => {
				reject();
			});
		})
	},
	display() {
		this.elGrid.querySelector('.study-bbar-page-value').innerHTML = this.currentPage;
		this.elGrid.querySelector('.study-bbar-page-total-value').innerHTML = this.totalPages;
		this.elTbody.innerHTML = '';
		let addRow = (row) => {
			let elTr = this.elTplTr.cloneNode(true);
			elTr.classList.remove('tpl');
			elTr.querySelector('.study-td-index').innerHTML = (this.currentPage - 1) * this.countPerPage + cnrWord + 1;
			if (!Helper.isObject(row)) {
				elTr.classList.add('empty');
			} else {
				elTr.querySelector('.study-td-word').innerHTML = row.word;
				elTr.querySelector('.study-td-translate').innerHTML = row.translate;
				let elIsStudy = elTr.querySelector('.study-td-is-study>i');
				if (row.isStudy === App.Idb.TRUE) {
					elIsStudy.classList.add('fas');
					elIsStudy.classList.add('fa-plus-circle');
					elIsStudy.classList.add('is-study-true');
				} else {
					elIsStudy.classList.add('fas');
					elIsStudy.classList.add('fa-minus-circle');
					elIsStudy.classList.add('is-study-false');
				}
			}
			this.elTbody.appendChild(elTr);
		};
		let cnrWord = 0;
		this.rows.forEach((row) => {
			addRow(row);
			++cnrWord;
		});
		for (; cnrWord < this.countPerPage; ++cnrWord) {
			addRow();
		}
	}
};