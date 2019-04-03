'use strict';
console.log('App.Component.Study.Table');

/**
 * Компонент "Таблица слов"
 **/
App.Component.Study.Grid = {
	/**
	 * Слова, на текущей странице таблицы
	 */
	wordsTablePage: {},
	countPerPage: 15,
	currentPage: 1,
	totalPages: 0,
	elGrid: undefined,
	init(elGrid) {
		this.elGrid = elGrid;
		this.elGrid.querySelector('.study-bbar-btn-next').addEventListener('click', this.onBbarBtnNextClick.bind(this));
		this.elGrid.querySelector('.study-bbar-btn-prev').addEventListener('click', this.onBbarBtnPrevClick.bind(this));
	},
	loadData() {
		return new Promise((resolve, reject) => {
			App.Idb.WordsStudy.getCountForLang(App.langStudy).then((result) => {
				this.totalPages = Math.ceil(result / this.countPerPage);
			}).then(()=>{
				return this.loadDataTable();
			}).then(()=>{
				resolve();
			});
		})
	},
	loadDataTable(){
		return new Promise((resolve, reject) => {
			App.Idb.WordsStudy.getAllAsObject(App.langStudy, {
				from: (this.currentPage - 1) * this.countPerPage,
				to: this.currentPage * this.countPerPage - 1
			}).then((words) => {
				this.wordsTablePage = words;
				resolve();
			});
		});
	},
	onBbarBtnNextClick(e) {
		if (this.currentPage >= this.totalPages) {
			return;
		}
		++this.currentPage;
		this.loadDataTable().then(()=>{
			this.display();
		});
	},
	onBbarBtnPrevClick(e) {
		if (this.currentPage <= 1) {
			return;
		}
		--this.currentPage;
		this.loadDataTable().then(()=>{
			this.display();
		});
	},
	display() {
		this.elGrid.querySelector('.study-bbar-page-value').innerHTML = this.currentPage;
		this.elGrid.querySelector('.study-bbar-page-total-value').innerHTML = this.totalPages;
		let elTbody = this.elGrid.querySelector('table>tbody');
		let elTplTr = elTbody.querySelector('tr.tpl');
		elTbody.querySelectorAll('tr').forEach((elTr)=>{
			if (elTr === elTplTr){
				return;
			}
			elTbody.removeChild(elTr);
		});
		let addRow = (wordStruct)=>{
			let elTr = elTplTr.cloneNode(true);
			elTr.classList.remove('tpl');
			elTr.querySelector('.study-td-index').innerHTML = (this.currentPage - 1) * this.countPerPage + cnrWord + 1;
			elTr.querySelector('.study-td-word').innerHTML = Helper.isObject(wordStruct) ? wordStruct.word : '';
			elTr.querySelector('.study-td-translate').innerHTML = '@TODO: get translate';
			elTbody.appendChild(elTr);
		};
		let cnrWord = 0;
		for(let word in this.wordsTablePage){
			addRow(this.wordsTablePage[word]);
			++cnrWord;
		}
		for(;cnrWord<this.countPerPage; ++cnrWord){
			addRow();
		}
	}
};