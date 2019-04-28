'use strict';

let el = undefined;

/**
 * Компонент "Выбор действия над указанным словом".
 */
export default class WinWordActions {
	static init() {
		el = document.getElementById('win-word-actions');
	}

	/**
	 *
	 * @param options
	 * @param options.onCancel
	 * @param options.onStudied
	 * @param options.onStudy
	 * @param options.onAnswerWrong
	 * @return { document.App.Component.WinWordCard}
	 */
	static show(options) {
		if (!document.Helper.isObject(options)) {
			this.throwError('show/Параметры не переданы');
		} else if (!document.Helper.isFunction(options.onStudied)) {
			this.throwError('show/Не передан параметр "onStudied"');
		} else if (!document.Helper.isFunction(options.onStudy)) {
			this.throwError('show/Не передан параметр "onStudy"');
		} else if (!document.Helper.isString(options.word)) {
			this.throwError('show/Не передан параметр "word"');
		} else if (!document.Helper.isString(options.translate)) {
			this.throwError('show/Не передан параметр "translate"');
		}
		// else if (!document.Helper.isFunction(options.onCancel)) {
		// 	this.throwError('show/Не передан параметр "onCancel"');
		// }
		el.querySelector('.word').innerHTML = options.word;
		el.querySelector('.translate').innerHTML = options.translate;


		el.onclick = (event) => {
			event.preventDefault();
			if (event.target.classList.contains('btn-cancel')) {
				(options.onCancel || document.Helper.emptyFn)();
				this.hide();
			} else if (event.target.classList.contains('btn-studied')) {
				options.onStudied();
				this.hide();
			} else if (event.target.classList.contains('btn-study')) {
				options.onStudy();
				this.hide();
			}
		};
		el.classList.remove('hidden');
		//document.querySelector('#modal-background').classList.remove('hidden');
		return this;
	}

	static hide() {
		el.classList.add('hidden');
		// document.querySelector('#modal-background').classList.add('hidden');
		return this;
	}

	static throwError(text) {
		throw new Error('WinWordActions/' + text);
	}
};