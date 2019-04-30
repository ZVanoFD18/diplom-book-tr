'use strict';

import './WinMsg.css';

const stat = {
	defaultTitle: 'Сообщение',
	defaultMessage: '...',
	defaultTextButtonClose: 'Ok'
};

/**
 * Компонент общего назначения "Вывести пользователю текст"
 */
export default class WinMsg {
	static getEl() {
		return document.getElementById('win-msg');
	}

	static show(options) {
		options = options || {};
		options = document.Helper.Obj.replaceMembers({
			title: document.App.localize(stat.defaultTitle),
			message: document.App.localize(stat.defaultMessage),
			textButtonClose: document.App.localize(stat.defaultTextButtonClose),
			callback: document.Helper.emptyFn
		}, options);
		this.getEl().querySelector('.win-msg-title').innerHTML = options.title;
		this.getEl().querySelector('.win-msg-text').innerHTML = options.message;
		this.getEl().querySelector('.win-msg-button-close').innerHTML = options.textButtonClose;
		this.getEl().classList.remove('hidden');
		document.querySelector('#modal-background').classList.remove('hidden');
		this.getEl().querySelector('.win-msg-button-close').onclick = () => {
			this.getEl().classList.add('hidden');
			document.querySelector('#modal-background').classList.add('hidden');
			options.callback();
		};
	}
};