'use strict';
export default class Ajax{
	/**
	 * Возвращает XHR в зависимости от браузера.
	 * @return {XMLHttpRequest}
	 */
	static getXhr() {
		let xhr;
		try {
			xhr = new XMLHttpRequest();
		} catch (e) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0");
			} catch (e) {
				try {
					xhr = new ActiveXObject("Msxml2.XMLHTTP.3.0");
				} catch (e) {
					try {
						xhr = new ActiveXObject("Msxml2.XMLHTTP");
					} catch (e) {
						try {
							xhr = new ActiveXObject("Microsoft.XMLHTTP");
						} catch (e) {
							throw new Error("This browser does not support XMLHttpRequest.");
						}
					}
				}
			}
		}
		return xhr;
	}
}