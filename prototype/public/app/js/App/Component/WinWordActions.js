'use strict';
console.log('App.Component.WinWordActions');

/**
 * Компонент "Выбор действия над указанным словом".
 */
App.Component.WinWordActions = {
	el : undefined,
	init(){
		this.el = document.getElementById('win-word-actions');
	},
	/**
	 *
	 * @param options
	 * @param options.onCancel
	 * @param options.onStudied
	 * @param options.onStudy
	 * @param options.onAnswerWrong
	 * @return {App.Component.WinWordCard}
	 */
	show(options) {
		if (!Helper.isObject(options)) {
			this.throwError('show/Параметры не переданы');
		} else if (!Helper.isFunction(options.onStudied)) {
			this.throwError('show/Не передан параметр "onStudied"');
		} else if (!Helper.isFunction(options.onStudy)) {
			this.throwError('show/Не передан параметр "onStudy"');
		} else if (!Helper.isString(options.word)){
			this.throwError('show/Не передан параметр "word"');
		} else if (!Helper.isString(options.translate)){
			this.throwError('show/Не передан параметр "translate"');
		}
		// else if (!Helper.isFunction(options.onCancel)) {
		// 	this.throwError('show/Не передан параметр "onCancel"');
		// }
		this.el.querySelector('.word').innerHTML = options.word;
		this.el.querySelector('.translate').innerHTML = options.translate;


		this.el.onclick = (event) => {
			event.preventDefault();
			if (event.target.classList.contains('btn-cancel')) {
				(options.onCancel || Helper.emptyFn)();
				this.hide();
			} else if (event.target.classList.contains('btn-studied')) {
				options.onStudied();
				this.hide();
			} else if (event.target.classList.contains('btn-study')) {
				options.onStudy();
				this.hide();
			}
		};
		this.el.classList.remove('hidden');
		//document.querySelector('#modal-background').classList.remove('hidden');
		return this;
	},
	hide() {
		this.el.classList.add('hidden');
		// document.querySelector('#modal-background').classList.add('hidden');
		return this;
	},
	throwError(text) {
		throw new Error('WinWordActions/' + text);
	}
};