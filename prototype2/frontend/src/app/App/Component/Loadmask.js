'use strict';
import './Loadmask.css';

/**
 * Хранилище псевдостатических свойств.
 * @type {Object}
 */
const stat = {
	/**
	 * Время инициации последнено показа Loadmask.
	 * @type {Number}
	 */
	showedAt: undefined,
	/**
	 * Минимальное время показа Loadmask.
	 * Этим параметром избавляемся от моргания при выполнении быстрых операций.
	 * Т.е. запрещаем скрытие маски раньше, чем showedAt + minTimeShow
	 * @type {Number} - миллисекунды
	 */
	minTimeShow: 500,
	/**
	 * Хендл таймера задержки скрытия  Loadmask
	 * @type {Number}
	 */
	timerHide: undefined
};

/**
 * Компонент "Маска загрузки".
 * Предназначен для блокирования интерфейса и индикации при длительной фонофой операции (например, AJAX).
 */
export default class Loadmask {
	static getEl() {
		return document.getElementById('loadmask');
	}

	/**
	 * Показать маску загрузки
	 * @param text
	 */
	static show(text) {
		if (stat.timerHide) {
			clearTimeout(stat.timerHide);
		}
		stat.showedAt = Date.now();
		if (text) {
			this.setMessage(text);
		}
		this.getEl().classList.remove('hidden');
	}

	/**
	 * Скрыть маску загрузки.
	 */
	static hide() {
		/**
		 * Количество миллисекунд, прошедшее со времени показа маски
		 * @type {number}
		 */
		const timeLeftMs = Date.now() - stat.showedAt;
		if (timeLeftMs >= stat.minTimeShow) {
			this.getEl().classList.add('hidden');
			if (stat.timerHide) {
				clearTimeout(stat.timerHide);
			}
		} else {
			const timeShedule = stat.minTimeShow - timeLeftMs;
			stat.timerHide = setTimeout(() => {
				this.hide();
			}, timeShedule > 0 ? timeShedule : 50);
		}
	}

	static setMessage(text) {
		this.getEl().querySelector('.loadmask-message').innerHTML = text;
	}
};
