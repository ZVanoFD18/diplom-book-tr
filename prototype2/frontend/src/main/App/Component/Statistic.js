'use strict';

import './Statistic.css';

/**
 * Раздел секции "Статистика"
 */
export default class Statistic {
	static display() {
		return new Promise((resolve, reject) => {
			document.App.Idb.WordsStudy.getStat(document.App.langStudy).then((stat) => {
				document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = stat.cntStudy || 0;
				document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = stat.cntStudied || 0;
				resolve(true);
			}).catch((e) => {
				document.Helper.Log.addDebug('Непредвиденная ошибка при получении статистики изучения слов');
				document.getElementById('statistic').querySelector('.stat-words-study').innerHTML = '???';
				document.getElementById('statistic').querySelector('.stat-words-studied').innerHTML = '???';
				resolve(false);
			})
		});
	}
};
