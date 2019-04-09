'use strict';
console.log('App.Component.Study');

/**
 * Раздел для переменных секции "Изучение слов"
 */
App.Component.Study = {
	/**
	 * @var {Array} of @see:  {App.Idb.WordsTranslate.Struct}
	 */
	wordsTranslate: [],
	/**
	 * Изучаемые сейчас слова.
	 * @var {Array} of @see: {App.Idb.WordsStudy.Struct}
	 */
	wordsStudy: [],
	wordsStudyProgress: {
		tplItem: {
			isMemorized: false,
			cntCorrect: 0,
			cntWrong: 0
		},
		algLang1ToLang2: [],
		algLang2ToLang1: []
	},

	defaults: {
		/**
		 * Количество слов для изучения за один заход.
		 */
		cntWordForStudy: 15,
		/**
		 * Количество правильных ответов для прохождения теста.
		 */
		cntCorrectForPass: 3
	},
	/**
	 * @see: DomElement '#study'
	 */
	elStudy: undefined,
	init(elStudy) {
		this.elStudy = elStudy;
		this.elStudy.querySelector('.study-panel-start').querySelector('input[name="cntToStudy"]').value = this.defaults.cntWordForStudy;
		this.elStudy.querySelector('.study-button-start').addEventListener('click', this.onButtonStartClick.bind(this));
		this.Grid.init(this.elStudy.querySelector('.study-words-grid'));
	},
	display() {
		this.Grid.loadData().then(() => {
			this.Grid.display();
		});
	},
	onButtonStartClick(e) {
		let cntToStudy = this.elStudy.querySelector('.study-panel-start').querySelector('input[name="cntToStudy"]').value;
		cntToStudy = parseInt(cntToStudy);
		if (!Helper.isNumber(cntToStudy) || cntToStudy < 1) {
			App.Component.WinMsg.show({
				title: 'Уведомление.',
				message: 'Недостаточно слов для изучения'
			});
			return;
		}
		App.Component.Loadmask.show('Получение списка слов для изучения...');
		App.Idb.WordsStudy.getForStudy(App.langStudy, cntToStudy).then((wordsForStudy) => {
			App.Component.Loadmask.hide();
			if (wordsForStudy.length < 1) {
				App.Component.WinMsg.show({
					title: 'Уведомление.',
					message: 'Недостаточно слов для изучения.<br>Следует добавить слова в разделе "Чтение"'
				});
				return;
			}
			this.wordsStudy = wordsForStudy;
			let wordsForTranslate = [];
			this.wordsStudy.forEach((wordStruct) => {
				wordsForTranslate.push(wordStruct.word);
			});
			App.getTranslates(wordsForTranslate).then((translateStructArray) => {
				this.wordsTranslate = translateStructArray;
				this.doStudy();
			});
		}).catch((e) => {
			Helper.Log.addDebug(e);
		})
	},
	/**
	 * Очищает прогресс и заполняет его пустыми структурами.
	 */
	clearProgress() {
		this.wordsStudyProgress.algLang1ToLang2 = [];
		this.wordsStudyProgress.algLang2ToLang1 = [];
		this.wordsStudy.forEach((wordStruct, index) => {
			this.wordsStudyProgress.algLang1ToLang2[index] = Object.assign({}, this.wordsStudyProgress.tplItem);
			this.wordsStudyProgress.algLang2ToLang1[index] = Object.assign({}, this.wordsStudyProgress.tplItem);
		});
	},
	/**
	 * Начать процесс изучения слов.
	 */
	doStudy() {
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
				App.Component.WinWordCard.hide();
				App.Component.WinMsg.show({
					title: 'Уведомление.',
					message: 'Все слова изучены'
				});
				App.Component.Statistic.display();
			})
			.catch((e) => {
				App.Component.WinMsg.show({
					title: '<span style="color: red;">Ошибка.</span>',
					message: e,
					textButtonClose: 'Ознакомлен',
				});
				App.Component.WinWordCard.hide();
			});
	},
	updateIdbWordStudy() {
		return Promise.all((() => {
			let promises = [];
			this.wordsStudy.forEach((wordStudyStruct, index) => {
				let progressItemLang1ToLang2 = this.wordsStudyProgress.algLang1ToLang2[index];
				let progressItemLang2ToLang1 = this.wordsStudyProgress.algLang2ToLang1[index];
				let wordStudyData = {
					isStudy: App.Idb.TRUE,
					isFinishedLang1ToLang2: App.Idb.getBool(progressItemLang1ToLang2.isMemorized
						|| (progressItemLang1ToLang2.cntCorrect - progressItemLang1ToLang2.cntWrong > this.defaults.cntCorrectForPass)
					),
					isFinishedLang2ToLang1: App.Idb.getBool(progressItemLang2ToLang1.isMemorized
						|| (progressItemLang2ToLang1.cntCorrect - progressItemLang2ToLang1.cntWrong > this.defaults.cntCorrectForPass)
					),
				};
				if (wordStudyData.isFinishedLang1ToLang2 && wordStudyData.isFinishedLang2ToLang1) {
					wordStudyData.isStudy = App.Idb.FALSE;
				}
				promises.push(App.Idb.WordsStudy.put(App.langStudy, wordStudyStruct.word, wordStudyData))
			});
			return promises;
		})());
	},
	/**
	 * С родного языка на изучаемый
	 * @return {Promise<any>}
	 */
	doStudyLang1ToLang2() {
		let answers = [];
		let cnrAttempt = 0;
		let currentSet;
		this.wordsTranslate.forEach((translateStruct) => {
			answers.push(translateStruct.word);
		});
		return new Promise((resolve, reject) => {
			doExam.call(this, resolve, reject);
		});

		function doExam(resolve, reject) {
			currentSet = getNextSet.call(this);
			if (!Helper.isDefined(currentSet)) {
				App.Component.WinWordCard.hide();
				return resolve();
			}
			App.Component.WinWordCard.update({
				title: 'Изучение слов с родного языка на целевой',
				word: currentSet.word,
				answers: answers,
				correctAnswer: currentSet.answer
			});
			if (cnrAttempt == 0) {
				App.Component.WinWordCard.show({
					onMemorized: () => {
						this.wordsStudyProgress.algLang1ToLang2[currentSet.wordIndex].isMemorized = true;
						doExam.call(this, resolve, reject);
					},
					onCancel: () => {
						reject('Пользователь отменил изучение')
					},
					onAnswerCorrect: () => {
						++this.wordsStudyProgress.algLang1ToLang2[currentSet.wordIndex].cntCorrect;
						doExam.call(this, resolve, reject);
					},
					onAnswerWrong: () => {
						++this.wordsStudyProgress.algLang1ToLang2[currentSet.wordIndex].cntWrong;
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

			this.wordsStudy.forEach((wordStudy, index) => {
				/**
				 * @type {this.wordsStudyProgress.tplItem} progressItem
				 */
				let progressItem = this.wordsStudyProgress.algLang1ToLang2[index];
				if (progressItem.isMemorized) {
					return;
				}
				if (progressItem.cntCorrect - progressItem.cntWrong < this.defaults.cntCorrectForPass) {
					wordsStudy.push(index);
				}
			});
			if (wordsStudy.length < 1) {
				return undefined;
			}
			let wordsStudyIndex = Math.floor(Math.random() * wordsStudy.length);
			result.wordIndex = wordsStudy[wordsStudyIndex];
			result.answer = this.wordsStudy[result.wordIndex].word;
			/**
			 *
			 * @type {App.Idb.WordsTranslate.Struct}
			 */
			let translateStruct = Helper.Obj.getObjectFromArray(this.wordsTranslate, 'word', result.answer);
			if (translateStruct !== undefined) {
				result.word = translateStruct.translate;
				return result;
			} else {
				App.Component.WinMsg.show({
					title: 'Ошибка!',
					message: 'Не удалось извлечь перевод из кеша.',
				});
				return undefined;
			}
		}
	},
	/**
	 * С изучаемого языка на родной
	 * @return {Promise<any>}
	 */
	doStudyLang2ToLang1() {
		let answers = [];
		let cnrAttempt = 0;
		let currentSet;
		this.wordsTranslate.forEach((translateStruct) => {
			answers.push(translateStruct.translate);
		});
		return new Promise((resolve, reject) => {
			doExam.call(this, resolve, reject);
		});

		function doExam(resolve, reject) {
			currentSet = getNextSet.call(this);
			if (!Helper.isDefined(currentSet)) {
				App.Component.WinWordCard.hide();
				return resolve();
			}
			App.Component.WinWordCard.update({
				title: 'Изучение слов с целевого языка на родной',
				word: currentSet.word,
				answers: answers,
				correctAnswer: currentSet.answer
			});
			if (cnrAttempt == 0) {
				App.Component.WinWordCard.show({
					onMemorized: () => {
						this.wordsStudyProgress.algLang2ToLang1[currentSet.wordIndex].isMemorized = true;
						doExam.call(this, resolve, reject);
					},
					onCancel: () => {
						reject('Пользователь отменил изучение')
					},
					onAnswerCorrect: () => {
						++this.wordsStudyProgress.algLang2ToLang1[currentSet.wordIndex].cntCorrect;
						doExam.call(this, resolve, reject);
					},
					onAnswerWrong: () => {
						++this.wordsStudyProgress.algLang2ToLang1[currentSet.wordIndex].cntWrong;
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

			this.wordsStudy.forEach((wordStudy, index) => {
				/**
				 * @type {this.wordsStudyProgress.tplItem} progressItem
				 */
				let progressItem = this.wordsStudyProgress.algLang2ToLang1[index];
				if (progressItem.isMemorized) {
					return;
				}
				if (progressItem.cntCorrect - progressItem.cntWrong < this.defaults.cntCorrectForPass) {
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
			 * @type {App.Idb.WordsTranslate.Struct}
			 */
			let translateStruct = Helper.Obj.getObjectFromArray(this.wordsTranslate, 'word', this.wordsStudy[result.wordIndex].word);
			if (!Helper.isDefined(translateStruct)) {
				App.Component.WinMsg.show({
					title: 'Ошибка!',
					message: 'Не удалось извлечь перевод из кеша.',
				});
				return undefined;
			}
			result.word = translateStruct.word;
			result.answer = translateStruct.translate;
			return result;
		}
	}
};