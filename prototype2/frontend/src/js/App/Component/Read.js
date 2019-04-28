'use strict';
import App from '../../App'
import WinWordActions from './WinWordActions';

/**
 * @see: HTML element '#read'
 */
let el = undefined;

/**
 * Раздел секции "Чтение".
 */
export default class Read {
	static init() {
		el = document.getElementById('read');
		el.addEventListener('click', this.onTextClick.bind(this));
		WinWordActions.init();
	}
	static displayBook(book) {
		return new Promise((resolve, reject) => {
			let elText = this.el;
			let wordsStudy = {};
			 document.App.Idb.WordsStudy.getAllAsObject( document.App.langStudy).then((resWords) => {
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
						let words = document.Helper.Text.getWords( document.App.langStudy, titleLine);
						words.forEach((word) => {
							let newElWord = document.createElement('span');
							newElWord.innerHTML = word;
							let hash = document.App.getWordHash(word);
							newElWord.classList.add('read-word');
							newElWord.classList.add('word-hash-' + hash);
							let normalizedWord = document.App.Idb.getNormalizedWord(word);
							if (normalizedWord in wordsStudy) {
								if (wordsStudy[normalizedWord].isStudy) {
									this.wordElMark(newElWord, document.App.WORD_STATE.WORD_STATE_STUDY);
								} else {
									this.wordElMark(newElWord, document.App.WORD_STATE.WORD_STATE_STUDYED);
								}
							} else {
								this.wordElMark(newElWord, document.App.WORD_STATE.WORD_STATE_UNKNOWN);
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
						let words = document.Helper.Text.getWords( document.App.langStudy, textLine);
						words.forEach((word) => {
							let newElWord = document.createElement('span');
							newElWord.innerHTML = word;
							let hash = document.App.getWordHash(word);
							newElWord.classList.add('read-word');
							newElWord.classList.add('word-hash-' + hash);
							let normalizedWord = document.App.Idb.getNormalizedWord(word);
							if (normalizedWord in wordsStudy) {
								if (wordsStudy[normalizedWord].isStudy) {
									this.wordElMark(newElWord, document.App.WORD_STATE.WORD_STATE_STUDY);
								} else {
									this.wordElMark(newElWord, document.App.WORD_STATE.WORD_STATE_STUDYED);
								}
							} else {
								this.wordElMark(newElWord, document.App.WORD_STATE.WORD_STATE_UNKNOWN);
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
	}

	/**
	 *
	 * @param {DomEvent} e
	 * @constructor
	 */
	static onTextClick(e) {
		if (!e.target.classList.contains('read-word')) {
			return;
		}
		let word = e.target.innerHTML;
		 document.App.Component.Loadmask.show( document.App.localize('Загрузка перевода...'));
		 document.App.getWordTranslate(word).then((translate) => {
			 document.App.Component.Loadmask.hide();
			WinWordActions.show({
				word: word,
				translate: translate,
				onStudy :()=>{
					 document.App.wordStudyAdd(word);
					this.wordsMark(word, document.App.WORD_STATE.WORD_STATE_STUDY);
				},
				onStudied : ()=>{
					 document.App.WordStudyedAdd(word);
					this.wordsMark(word, document.App.WORD_STATE.WORD_STATE_STUDYED);
				}
			});
		}).catch((e) => {
			elDialog.querySelector('.translate').innerHTML = '???';
			document.Helper.Log.addDebug(e);
			elDialog.classList.add('hidden');
			 document.App.Component.WinMsg.show({
				title: document.App.localize('Ошибка!'),
				message: e instanceof Error ? e.message : document.App.localize('Не удалось получить перевод слова')
			});
			 document.App.Component.Loadmask.hide();
		});

		let elDialog = document.getElementById('win-word-actions');
		elDialog.classList.add('hidden');
		elDialog.querySelector('.word').innerHTML = e.target.innerHTML;
		elDialog.querySelector('.translate').innerHTML = '...';
		elDialog.classList.remove('hidden');

	}

	static wordElMark(elWord, state) {
		elWord.classList.remove('read-word-unknown');
		elWord.classList.remove('read-word-study');
		elWord.classList.remove('read-word-studied');
		switch (state) {
			case document.App.WORD_STATE.WORD_STATE_STUDY:
				elWord.classList.add('read-word-study');
				break;
			case document.App.WORD_STATE.WORD_STATE_STUDYED:
				elWord.classList.add('read-word-studied');
				break;
			case document.App.WORD_STATE.WORD_STATE_UNKNOWN:
				elWord.classList.add('read-word-unknown');
				break;
		}
	}

	static wordsMark(words, state) {
		if (!document.Helper.isArray(words)) {
			words = [words];
		}
		words.forEach((word) => {
			let classWordHash = 'word-hash-' + document.App.getWordHash(word);
			let words = el.querySelectorAll('.' + classWordHash);
			words.forEach((elWord) => {
				this.wordElMark(elWord, state);
			});
		})
	}
};
