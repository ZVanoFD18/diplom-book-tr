'use strict';
console.log('App.Component.Read');

/**
 * Раздел секции "Чтение".
 */
App.Component.Read = {
	/**
	 * @see: '#read'
	 */
	el: undefined,
	init() {
		this.el = document.getElementById('read');
		this.el.addEventListener('click', this.onTextClick.bind(this));
		App.Component.WinWordActions.init();
	},
	displayBook(book) {
		return new Promise((resolve, reject) => {
			let elText = this.el;
			let wordsStudy = {};
			App.Idb.WordsStudy.getAllAsObject(App.langStudy).then((resWords) => {
				wordsStudy = resWords;
				parseBook();
			}).catch(() => {
				parseBook();
			});

			let parseBook = () => {
				elText.innerHTML = '';
				book.sections.forEach((section) => {
					let containerTitle = document.createElement('h2');
					containerTitle.classList.add('read-text-title');
					section.title.forEach((titleLine) => {
						let elLine = document.createElement('p');
						elLine.classList.add('read-text-title-item');
						let words = Helper.Text.getWords(App.langStudy, titleLine);
						words.forEach((word) => {
							let newElWord = document.createElement('span');
							newElWord.innerHTML = word;
							let hash = App.getWordHash(word);
							newElWord.classList.add('read-word');
							newElWord.classList.add('word-hash-' + hash);
							let normalizedWord = App.Idb.getNormalizedWord(word);
							if (normalizedWord in wordsStudy) {
								if (wordsStudy[normalizedWord].isStudy) {
									this.wordElMark(newElWord, App.WORD_STATE.WORD_STATE_STUDY);
								} else {
									this.wordElMark(newElWord, App.WORD_STATE.WORD_STATE_STUDYED);
								}
							} else {
								this.wordElMark(newElWord, App.WORD_STATE.WORD_STATE_UNKNOWN);
							}
							elLine.appendChild(newElWord);
						});
						containerTitle.appendChild(elLine);
					});
					elText.appendChild(containerTitle);

					let containerSubtext = document.createElement('p');
					containerSubtext.classList.add('read-text-line');
					section.p.forEach((textLine) => {
						let elLine = document.createElement('p');
						elLine.classList.add('read-text-line');
						let words = Helper.Text.getWords(App.langStudy, textLine);
						words.forEach((word) => {
							let newElWord = document.createElement('span');
							newElWord.innerHTML = word;
							let hash = App.getWordHash(word);
							newElWord.classList.add('read-word');
							newElWord.classList.add('word-hash-' + hash);
							let normalizedWord = App.Idb.getNormalizedWord(word);
							if (normalizedWord in wordsStudy) {
								if (wordsStudy[normalizedWord].isStudy) {
									this.wordElMark(newElWord, App.WORD_STATE.WORD_STATE_STUDY);
								} else {
									this.wordElMark(newElWord, App.WORD_STATE.WORD_STATE_STUDYED);
								}
							} else {
								this.wordElMark(newElWord, App.WORD_STATE.WORD_STATE_UNKNOWN);
							}

							elLine.appendChild(newElWord);
						});
						containerSubtext.appendChild(elLine);
					});
					elText.appendChild(containerSubtext);
				});
				resolve();
			}
		});
	},

	/**
	 *
	 * @param {DomEvent} e
	 * @constructor
	 */
	onTextClick(e) {
		if (!e.target.classList.contains('read-word')) {
			return;
		}
		let word = e.target.innerHTML;
		App.Component.Loadmask.show(App.localize('Загрузка перевода...'));
		App.getWordTranslate(word).then((translate) => {
			App.Component.Loadmask.hide();
			App.Component.WinWordActions.show({
				word: word,
				translate: translate,
				onStudy :()=>{
					App.wordStudyAdd(word);
					this.wordsMark(word, App.WORD_STATE.WORD_STATE_STUDY);
				},
				onStudied : ()=>{
					App.WordStudyedAdd(word);
					this.wordsMark(word, App.WORD_STATE.WORD_STATE_STUDYED);
				}
			});
		}).catch((e) => {
			elDialog.querySelector('.translate').innerHTML = '???';
			Helper.Log.addDebug(e);
			elDialog.classList.add('hidden');
			App.Component.WinMsg.show({
				title: App.localize('Ошибка!'),
				message: e instanceof Error ? e.message : App.localize('Не удалось получить перевод слова')
			});
			App.Component.Loadmask.hide();
		});

		let elDialog = document.getElementById('win-word-actions');
		elDialog.classList.add('hidden');
		elDialog.querySelector('.word').innerHTML = e.target.innerHTML;
		elDialog.querySelector('.translate').innerHTML = '...';
		elDialog.classList.remove('hidden');

	},

	wordElMark(elWord, state) {
		elWord.classList.remove('read-word-unknown');
		elWord.classList.remove('read-word-study');
		elWord.classList.remove('read-word-studied');
		switch (state) {
			case App.WORD_STATE.WORD_STATE_STUDY:
				elWord.classList.add('read-word-study');
				break;
			case App.WORD_STATE.WORD_STATE_STUDYED:
				elWord.classList.add('read-word-studied');
				break;
			case App.WORD_STATE.WORD_STATE_UNKNOWN:
				elWord.classList.add('read-word-unknown');
				break;
		}
	},

	wordsMark(words, state) {
		if (!Helper.isArray(words)) {
			words = [words];
		}
		words.forEach((word) => {
			let classWordHash = 'word-hash-' + App.getWordHash(word);
			let words = this.el.querySelectorAll('.' + classWordHash);
			words.forEach((elWord) => {
				this.wordElMark(elWord, state);
			});
		})
	}
};