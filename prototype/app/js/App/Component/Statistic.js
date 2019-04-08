'use strict';
console.log('App.Component.Statistic');

/**
 * Раздел секции "Статистика"
 */
App.Component.Statistic = {
	display() {
		App.Idb.WordsStudy.getStat(App.langStudy).then((stat) => {
			document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = stat.cntStudy;
			document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = stat.cntStudied;
		}).catch((e) => {
			Helper.Log.addDebug('Непредвиденная ошибка при получении статистики изучения слов');
			document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = '???';
			document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = '???';
		})
	}
};