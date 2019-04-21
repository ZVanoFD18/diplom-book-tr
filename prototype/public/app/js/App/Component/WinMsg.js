'use strict';
console.log('App.Component.WinMsg');

/**
 * Компонент общего назначения "Вывести пользователю текст"
 */
App.Component.WinMsg = {
	defaultTitle: 'Сообщение',
	defaultMessage: '...',
	defaultTextButtonClose: 'Ok',
	getEl() {
		return document.getElementById('win-msg');
	},
	show(options) {
		options = options || {};
		options = Helper.Obj.replaceMembers({
			title : App.localize(this.defaultTitle),
			message : App.localize(this.defaultMessage),
			textButtonClose : App.localize(this.defaultTextButtonClose),
			callback : Helper.emptyFn
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