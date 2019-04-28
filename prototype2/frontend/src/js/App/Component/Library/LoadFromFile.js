'use strict';

import Library from '../Library';

let elInput = undefined;

/**
 * Компонент, позволяющий выбрать файл для чтения с диска.
 */
export default class LoadFromFile {
	static init() {
		elInput = Library.getEl().querySelector('input[name="inpFile"]');
		document.querySelector('.library-loadfromfile-button').addEventListener('click', this.onInputButtonClick.bind(this));
		elInput.addEventListener('change', this.onInputFileChange.bind(this));
	}

	static onInputButtonClick() {
		elInput.click();
	}

	static onInputFileChange(event) {
		document.App.Component.Loadmask.show(document.App.localize('Загрузка файла...'));
		document.Helper.Io.loadTextFromInputFile(event.srcElement).then((text) => {
			event.srcElement.value = null;
			document.App.Component.Loadmask.hide();
			document.App.bookToRead(text, true).then(() => {
				document.App.Component.Nav.go2section('read');
			}).catch((e) => {
				document.App.Component.Loadmask.hide();
				document.App.Component.WinMsg.show({
					title: document.App.localize('Уведомление.'),
					message: (e instanceof document.App.Errors.User) ? e.message : document.App.localize('Ошибка при обработке книги')
				});
			});
			document.App.Component.Library.isDisplayed = false;
		}).catch((e) => {
			document.App.Component.Loadmask.hide();
			document.Helper.Log.addDebug(e);
		});
	}
};