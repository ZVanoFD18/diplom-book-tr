'use strict';

import Grid from './Study/Grid'

/**
 * @var {Array} of @see:  { document.App.Idb.WordsTranslate.Struct}
 */
let wordsTranslate = [];
/**
 * Изучаемые сейчас слова.
 * @var {Array} of @see: { document.App.Idb.WordsStudy.Struct}
 */
let wordsStudy = [];
let wordsStudyProgress = {
	tplItem: {
		isMemorized: false,
		cntCorrect: 0,
		cntWrong: 0
	},
	algLang1ToLang2: [],
	algLang2ToLang1: []
};

let defaults = {
	/**
	 * Количество слов для изучения за один заход.
	 */
	cntWordForStudy: 6,
	/**
	 * Количество правильных ответов для прохождения теста.
	 */
	cntCorrectForPass: 3
};
/**
 * @see: DomElement '#study'
 */
let elStudy = undefined;

/**
 * Раздел для переменных секции "Изучение слов"
 */
export default class Study {
	static init() {
		elStudy = document.getElementById('study');
		elStudy.querySelector('.study-panel-start').querySelector('input[name="cntToStudy"]').value = defaults.cntWordForStudy;
		elStudy.querySelector('.study-button-start').addEventListener('click', this.onButtonStartClick.bind(this));
		Grid.init(elStudy.querySelector('.study-words-grid'));
	}

	static display() {
		Grid.reload();
	}

	static onButtonStartClick(e) {
		let cntToStudy = elStudy.querySelector('.study-panel-start').querySelector('input[name="cntToStudy"]').value;
		cntToStudy = parseInt(cntToStudy);
		if (!document.Helper.isNumber(cntToStudy) || cntToStudy < 1) {
			 document.App.Component.WinMsg.show({
				title: document.App.localize('Уведомление.'),
				message: document.App.localize('Недостаточно слов для изучения')
			});
			return;
		}
		 document.App.Component.Loadmask.show( document.App.localize('Получение списка слов для изучения...'));
		 document.App.Idb.WordsStudy.getForStudy( document.App.langStudy, cntToStudy).then((wordsForStudy) => {
			 document.App.Component.Loadmask.hide();
			if (wordsForStudy.length < 1) {
				 document.App.Component.WinMsg.show({
					title: document.App.localize('Уведомление.'),
					message: document.App.localize('Недостаточно слов для изучения.<br>Следует добавить слова в разделе "Чтение"')
				});
				return;
			}
			wordsStudy = wordsForStudy;
			let wordsForTranslate = [];
			wordsStudy.forEach((wordStruct) => {
				wordsForTranslate.push(wordStruct.word);
			});
			 document.App.getWordsTranslate(wordsForTranslate).then((translateStructArray) => {
				wordsTranslate = translateStructArray;
				this.doStudy();
			});
		}).catch((e) => {
			document.Helper.Log.addDebug(e);
		})
	}

	/**
	 * Очищает прогресс и заполняет его пустыми структурами.
	 */
	static clearProgress() {
		wordsStudyProgress.algLang1ToLang2 = [];
		wordsStudyProgress.algLang2ToLang1 = [];
		wordsStudy.forEach((wordStruct, index) => {
			wordsStudyProgress.algLang1ToLang2[index] = Object.assign({}, wordsStudyProgress.tplItem);
			wordsStudyProgress.algLang2ToLang1[index] = Object.assign({}, wordsStudyProgress.tplItem);
		});
	}

	/**
	 * Начать процесс изучения слов.
	 */
	static doStudy() {
		this.clearProgress();
		this.doStudyLang1ToLang2()
			.then(() => {
				return this.updateIdbWordStudy();
			})
			.then(() => {
				return this.doStudyLang2ToLang1();
			})
			.then(() => {
				return this.updateIdbWordStudy();
			})
			.then(() => {
				 document.App.Component.WinWordCard.hide();
				 document.App.Component.WinMsg.show({
					title: document.App.localize('Уведомление.'),
					message: document.App.localize('Все слова изучены')
				});
				 document.App.Component.Statistic.display();
				 document.App.Component.Study.Grid.reload();
				 document.App.Component.Read.wordsMark(document.Helper.Obj.getFieldsAsArray(wordsStudy, 'word'), document.App.WORD_STATE.WORD_STATE_STUDYED);
			})
			.catch((e) => {
				 document.App.Component.WinWordCard.hide();
				 document.App.Component.Read.wordsMark(document.Helper.Obj.getFieldsAsArray(wordsStudy, 'word'), document.App.WORD_STATE.WORD_STATE_STUDY);
				if (e instanceof document.App.Errors.User) {
					 document.App.Component.WinMsg.show({
						title: document.App.localize('Уведомление'),
						message: e.message,
						textButtonClose: document.App.localize('Ок'),
					});
				} else {
					 document.App.Component.WinMsg.show({
						title: '<span style="color: red;">' + document.App.localize('Ошибка.') + '</span>',
						message: e,
						textButtonClose: document.App.localize('Ок'),
					});
				}
			});
	}

	static updateIdbWordStudy() {
		return Promise.all((() => {
			let promises = [];
			wordsStudy.forEach((wordStudyStruct, index) => {
				let progressItemLang1ToLang2 = wordsStudyProgress.algLang1ToLang2[index];
				let progressItemLang2ToLang1 = wordsStudyProgress.algLang2ToLang1[index];
				let wordStudyData = {
					isStudy: document.App.Idb.TRUE,
					isFinishedLang1ToLang2: document.App.Idb.getBool(progressItemLang1ToLang2.isMemorized
						|| (progressItemLang1ToLang2.cntCorrect - progressItemLang1ToLang2.cntWrong >= defaults.cntCorrectForPass)
					),
					isFinishedLang2ToLang1: document.App.Idb.getBool(progressItemLang2ToLang1.isMemorized
						|| (progressItemLang2ToLang1.cntCorrect - progressItemLang2ToLang1.cntWrong >= defaults.cntCorrectForPass)
					),
				};
				if (wordStudyData.isFinishedLang1ToLang2 && wordStudyData.isFinishedLang2ToLang1) {
					wordStudyData.isStudy = document.App.Idb.FALSE;
				}
				promises.push( document.App.Idb.WordsStudy.put( document.App.langStudy, wordStudyStruct.word, wordStudyData))
			});
			return promises;
		})());
	}

	/**
	 * С родного языка на изучаемый
	 * @return {Promise<any>}
	 */
	static doStudyLang1ToLang2() {
		let answers = [];
		let cnrAttempt = 0;
		let currentSet;
		wordsTranslate.forEach((translateStruct) => {
			answers.push(translateStruct.word);
		});
		return new Promise((resolve, reject) => {
			doExam.call(this, resolve, reject);
		});

		function doExam(resolve, reject) {
			currentSet = getNextSet.call(this);
			if (!document.Helper.isDefined(currentSet)) {
				 document.App.Component.WinWordCard.hide();
				return resolve();
			}
			 document.App.Component.WinWordCard.update({
				title: document.App.localize('Изучение слов с родного языка на целевой'),
				word: currentSet.word,
				answers: answers,
				correctAnswer: currentSet.answer
			});
			if (cnrAttempt == 0) {
				 document.App.Component.WinWordCard.show({
					onMemorized: () => {
						wordsStudyProgress.algLang1ToLang2[currentSet.wordIndex].isMemorized = true;
						doExam.call(this, resolve, reject);
					},
					onCancel: () => {
						reject(new document.App.Errors.User.PressCancel( document.App.localize('Пользователь отменил изучение')))
					},
					onAnswerCorrect: () => {
						++wordsStudyProgress.algLang1ToLang2[currentSet.wordIndex].cntCorrect;
						doExam.call(this, resolve, reject);
					},
					onAnswerWrong: () => {
						++wordsStudyProgress.algLang1ToLang2[currentSet.wordIndex].cntWrong;
						doExam.call(this, resolve, reject);
					}
				});
			}
			cnrAttempt++;
		}

		/**
		 * Возвращает следующий набор данных для изучения слова.
		 */
		function getNextSet() {
			let result = {
				wordIndex: undefined,
				word: undefined,
				answer: undefined
			};
			let wordsStudy = [];

			wordsStudy.forEach((wordStudy, index) => {
				/**
				 * @type {wordsStudyProgress.tplItem} progressItem
				 */
				let progressItem = wordsStudyProgress.algLang1ToLang2[index];
				if (progressItem.isMemorized) {
					return;
				}
				if (progressItem.cntCorrect - progressItem.cntWrong < defaults.cntCorrectForPass) {
					wordsStudy.push(index);
				}
			});
			if (wordsStudy.length < 1) {
				return undefined;
			}
			let wordsStudyIndex = Math.floor(Math.random() * wordsStudy.length);
			result.wordIndex = wordsStudy[wordsStudyIndex];
			result.answer = wordsStudy[result.wordIndex].word;
			/**
			 *
			 * @type { document.App.Idb.WordsTranslate.Struct}
			 */
			let translateStruct = document.Helper.Obj.getObjectFromArray(wordsTranslate, 'word', result.answer);
			if (translateStruct !== undefined) {
				result.word = translateStruct.translate;
				return result;
			} else {
				 document.App.Component.WinMsg.show({
					title: document.App.localize('Ошибка!'),
					message: document.App.localize('Не удалось извлечь перевод из кеша.'),
				});
				return undefined;
			}
		}
	}

	/**
	 * С изучаемого языка на родной
	 * @return {Promise<any>}
	 */
	static doStudyLang2ToLang1() {
		let answers = [];
		let cnrAttempt = 0;
		let currentSet;
		wordsTranslate.forEach((translateStruct) => {
			answers.push(translateStruct.translate);
		});
		return new Promise((resolve, reject) => {
			doExam.call(this, resolve, reject);
		});

		function doExam(resolve, reject) {
			currentSet = getNextSet.call(this);
			if (!document.Helper.isDefined(currentSet)) {
				 document.App.Component.WinWordCard.hide();
				return resolve();
			}
			 document.App.Component.WinWordCard.update({
				title: document.App.localize('Изучение слов с целевого языка на родной'),
				word: currentSet.word,
				answers: answers,
				correctAnswer: currentSet.answer
			});
			if (cnrAttempt == 0) {
				 document.App.Component.WinWordCard.show({
					onMemorized: () => {
						wordsStudyProgress.algLang2ToLang1[currentSet.wordIndex].isMemorized = true;
						doExam.call(this, resolve, reject);
					},
					onCancel: () => {
						reject(new document.App.Errors.User.PressCancel( document.App.localize('Пользователь отменил изучение')));
					},
					onAnswerCorrect: () => {
						++wordsStudyProgress.algLang2ToLang1[currentSet.wordIndex].cntCorrect;
						doExam.call(this, resolve, reject);
					},
					onAnswerWrong: () => {
						++wordsStudyProgress.algLang2ToLang1[currentSet.wordIndex].cntWrong;
						doExam.call(this, resolve, reject);
					}
				});
			}
			cnrAttempt++;
		}

		/**
		 * Возвращает следующий набор данных для изучения слова.
		 */
		function getNextSet() {
			let result = {
				wordIndex: undefined,
				word: undefined,
				answer: undefined
			};
			let wordsStudy = [];

			wordsStudy.forEach((wordStudy, index) => {
				/**
				 * @type {wordsStudyProgress.tplItem} progressItem
				 */
				let progressItem = wordsStudyProgress.algLang2ToLang1[index];
				if (progressItem.isMemorized) {
					return;
				}
				if (progressItem.cntCorrect - progressItem.cntWrong < defaults.cntCorrectForPass) {
					wordsStudy.push(index);
				}
			});
			if (wordsStudy.length < 1) {
				return undefined;
			}
			let wordsStudyIndex = Math.floor(Math.random() * wordsStudy.length);
			result.wordIndex = wordsStudy[wordsStudyIndex];
			/**
			 *
			 * @type { document.App.Idb.WordsTranslate.Struct}
			 */
			let translateStruct = document.Helper.Obj.getObjectFromArray(wordsTranslate, 'word', wordsStudy[result.wordIndex].word);
			if (!document.Helper.isDefined(translateStruct)) {
				 document.App.Component.WinMsg.show({
					title: document.App.localize('Ошибка!'),
					message: document.App.localize('Не удалось извлечь перевод из кеша.')
				});
				return undefined;
			}
			result.word = translateStruct.word;
			result.answer = translateStruct.translate;
			return result;
		}
	}
};
