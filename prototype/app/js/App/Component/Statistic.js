'use strict';
console.log('App.Component.Statistic');

/**
 * Раздел секции "Статистика"
 */
App.Component.Statistic = {
	display() {
		return new Promise((resolve, reject)=>{
			App.Idb.WordsStudy.getStat(App.langStudy).then((stat) => {
				document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = stat.cntStudy || 0;
				document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = stat.cntStudied || 0;
				resolve(true);
			}).catch((e) => {
				Helper.Log.addDebug('Непредвиденная ошибка при получении статистики изучения слов');
				document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = '???';
				document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = '???';
				resolve(false);
			})
		});
	}
};