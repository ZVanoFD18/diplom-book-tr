export default () => {
	const {detect} = require('detect-browser');
	const semver = require('semver');

	const SUPPORT_STATUS = {
		SUPPORTED: 'SUPPORTED',
		NOT_SUPPORTED: 'NOT_SUPPORTED',
		UNKNOWN: 'UNKNOWN'
	};
	let supportStatus = SUPPORT_STATUS.UNKNOWN;

	const browser = detect();
	switch (browser && browser.name) {
		case 'ie':
		// goto next
		case 'edge':
			supportStatus = SUPPORT_STATUS.NOT_SUPPORTED;
			break;
		case 'chrome':
			if (semver.satisfies(browser.version, '< 48.0.0')) {
				supportStatus = SUPPORT_STATUS.NOT_SUPPORTED;
			} else if (semver.satisfies(browser.version, '>= 48.0.0 && < 58.0.0')) {
				supportStatus = SUPPORT_STATUS.UNKNOWN;
			} else if (semver.satisfies(browser.version, '>= 58.0.0')) {
				supportStatus = SUPPORT_STATUS.SUPPORTED;
			}
			break;
		case 'firefox':
			if (semver.satisfies(browser.version, '< 44.0.0')) {
				supportStatus = SUPPORT_STATUS.NOT_SUPPORTED;
			} else if (semver.satisfies(browser.version, '>= 44.0.0 && < 51.0.0')) {
				supportStatus = SUPPORT_STATUS.UNKNOWN;
			} else if (semver.satisfies(browser.version, '>= 51.0.0')) {
				supportStatus = SUPPORT_STATUS.SUPPORTED;
			}
			break;
		case 'opera':
			if (semver.satisfies(browser.version, '< 35.0.0')) {
				supportStatus = SUPPORT_STATUS.NOT_SUPPORTED;
			} else if (semver.satisfies(browser.version, '>= 35.0.0 && < 45.0.0')) {
				supportStatus = SUPPORT_STATUS.UNKNOWN;
			} else if (semver.satisfies(browser.version, '>= 45.0.0')) {
				supportStatus = SUPPORT_STATUS.SUPPORTED;
			}
			break;
		default:
			supportStatus = SUPPORT_STATUS.UNKNOWN;
	}
	if (supportStatus === SUPPORT_STATUS.NOT_SUPPORTED) {
		Unlaunch();
	} else if (supportStatus === SUPPORT_STATUS.UNKNOWN) {
		let msg = "Your browser has not been tested for compatibility.\nThe application may work with errors.\n\nContinue anyway?";
		if (IsLocaleNear('ru') || IsLocaleNear('ua')) {
			msg = "Ваш браузер не тестировался на совместимость. \nПриложение может работать с ошибками.\n\n Все равно продолжить?";
		}
		if (confirm(msg)) {
			Launch();
		} else {
			Unlaunch();
		}
	} else {
		Launch();
	}

	function IsLocaleNear(locale) {
		return navigator.language.indexOf(locale) >= 0;
	}

	function LoadScript(url, callback){
		let elScript = document.createElement('script');
		elScript.src = url;
		elScript.onload = function () {
			callback(true);
		};
		elScript.onlerror = function () {
			callback(false);
		};
		document.head.appendChild(elScript);
	}

	function Launch() {
		let elScript = document.createElement('script');
		LoadScript('polyfill.js', function (isSuccess) {
			if (!isSuccess){
				alert('app not loaded');
				return;
			}
			LoadScript('app.js', function (isSuccess) {
				if (!isSuccess){
					alert('app not loaded');
					return;
				}
				document.getElementById('bootstrap').remove();
				document.getElementById('gui').style = '';
			});
		});
	}

	function Unlaunch() {
		document.querySelector('#bootstrap .bootstrap-loading').classList.add('hidden');
		document.querySelector('#bootstrap .bootstrap-fail').classList.remove('hidden');
	}
}
