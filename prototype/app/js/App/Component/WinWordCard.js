'use strict';
console.log('App.Component.WinWordCard');

/**
 * Компонент "Окно, карточка изучения слова"
 */
App.Component.WinWordCard = {
	correctAnswer: undefined,
	defaults: {
		title: 'Изучение слова'
	},
	getEl() {
		return document.getElementById('win-word-card');
	},
	/**
	 *
	 * @param options
	 * @param options.onCancel
	 * @param options.onMemorized
	 * @param options.onAnswerCorrect
	 * @param options.onAnswerWrong
	 * @return {App.Component.WinWordCard}
	 */
	show(options) {
		if (!Helper.isObject(options)) {
			this.throwError('show/Параметры не переданы');
		} else if (!Helper.isFunction(options.onCancel)) {
			this.throwError('show/Не передан параметр "onCancel"');
		} else if (!Helper.isFunction(options.onMemorized)) {
			this.throwError('show/Не передан параметр "onMemorized"');
		} else if (!Helper.isFunction(options.onAnswerCorrect)) {
			this.throwError('show/Не передан параметр "onAnswerCorrect"');
		} else if (!Helper.isFunction(options.onAnswerWrong)) {
			this.throwError('show/Не передан параметр "onAnswerWrong"');
		}
		this.getEl().querySelector('.win-word-card-window').onclick = (event) => {
			event.preventDefault();
			if (event.target.classList.contains('win-word-card-btn-cancel')) {
				options.onCancel();
			} else if (event.target.classList.contains('win-word-card-btn-memorized')) {
				options.onMemorized();
			} else if (event.target.classList.contains('win-word-card-answer')) {
				if (event.target.innerHTML === this.correctAnswer) {
					event.target.classList.add('correct');
					setTimeout(()=>{
						event.target.classList.remove('correct');
						options.onAnswerCorrect();
					}, 700);
				} else {
					event.target.classList.add('wrong');
					setTimeout(()=>{
						event.target.classList.remove('wrong');
						options.onAnswerWrong();
					}, 1500);
				}
			}
		};
		this.getEl().classList.remove('hidden');
		return this;
	},
	hide() {
		this.getEl().classList.add('hidden');
		return this;
	},
	/**
	 *
	 * @param options
	 * @param options.title
	 * @param options.word
	 * @param options.answers
	 * @param options.correctAnswer
	 * @return {App.Component.WinWordCard}
	 */
	update(options) {
		if (!Helper.isObject(options)) {
			this.throwError('update/Не переданы параметы');
		} else if (!Helper.isString(options.word)) {
			this.throwError('update/Не передан параметр "word"');
		} else if (!Helper.isArray(options.answers)) {
			this.throwError('update/Не передан параметр "answers"');
		} else if (!Helper.isString(options.correctAnswer)) {
			this.throwError('update/Не передан параметр "correctAnswer"');
		}
		this.correctAnswer = options.correctAnswer;
		let elAnsvers = this.getEl().querySelector('.win-word-card-answers'),
			elTplAnswer = this.getEl().querySelector('.tpl.win-word-card-answer');
		this.getEl().querySelector('.win-word-card-title').innerHTML = options.title || this.defaults.title;
		this.getEl().querySelector('.win-word-card-word').innerHTML = options.word;
		elAnsvers.innerHTML = '';
		options.answers.forEach((answer) => {
			let newElAnswer = elTplAnswer.cloneNode(true);
			newElAnswer.classList.remove('tpl');
			newElAnswer.innerHTML = answer;
			elAnsvers.appendChild(newElAnswer);
		});
		return this;
	},
	throwError(text) {
		throw new Error('WinWordCard/' + text);
	}
};