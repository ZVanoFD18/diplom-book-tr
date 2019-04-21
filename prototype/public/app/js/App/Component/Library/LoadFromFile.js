'use strict';
console.log('App.Component.Library.LoadFromFile');

/**
 * Компонент, позволяющий выбрать файл для чтения с диска.
 */
App.Component.Library.LoadFromFile = {
	elInput: undefined,
	init() {
		this.elInput = document.querySelector('input[name="inpFile"]');
		document.querySelector('.library-loadfromfile-button').addEventListener('click', this.onInputButtonClick.bind(this));
		this.elInput.addEventListener('change', this.onInputFileChange.bind(this));
	},
	onInputButtonClick() {
		this.elInput.click();
	},
	onInputFileChange(event) {
		App.Component.Loadmask.show(App.localize('Загрузка файла...'));
		Helper.Io.loadTextFromInputFile(event.srcElement).then((text) => {
			event.srcElement.value = null;
			App.Component.Loadmask.hide();
			App.bookToRead(text, true).then(() => {
				App.Component.Nav.go2section('read');
			}).catch((e) => {
				App.Component.Loadmask.hide();
				App.Component.WinMsg.show({
					title: App.localize('Уведомление.'),
					message: (e instanceof App.Errors.User) ? e.message : App.localize('Ошибка при обработке книги')
				});
			});
			App.Component.Library.isDisplayed = false;
		}).catch((e) => {
			App.Component.Loadmask.hide();
			Helper.Log.addDebug(e);
		});
	}
};