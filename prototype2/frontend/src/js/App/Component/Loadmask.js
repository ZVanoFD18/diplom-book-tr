'use strict';
export default class Loadmask {
	static getEl() {
		return document.getElementById('loadmask');
	}

	static show(text) {
		if (text) {
			this.setMessage(text);
		}
		this.getEl().classList.remove('hidden');
	}

	static hide() {
		this.getEl().classList.add('hidden');
	}

	static setMessage(text) {
		this.getEl().querySelector('.loadmask-message').innerHTML = text;
	}
};
