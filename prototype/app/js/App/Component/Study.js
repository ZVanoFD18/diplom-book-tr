'use strict';
console.log('App.Component.Study');

/**
 * Раздел для переменных секции "Изучение слов"
 */
App.Component.Study = {
	/**
	 * Изучаемые сейчас слова.
	 */
	wordsStudy: [],
	init(elStudy){
		this.Grid.init(elStudy.querySelector('.study-words-grid'));
	},
	display(){
		this.Grid.loadData().then(()=>{
			this.Grid.display();
		});
	}
};