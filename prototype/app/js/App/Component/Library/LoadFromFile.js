'use strict';
console.log('App.Component.Library.LoadFromFile');

/**
 * Компонент, позволяющий выбрать файл для чтения с диска.
 */
App.Component.Library.LoadFromFile = {
	init(){
		document.querySelector('input[name="inpFile"]').addEventListener('change', this.onInputFileChange.bind(this));
	},

	onInputFileChange(event) {
		App.Component.Loadmask.show('Загрузка файла...');
		Helper.Io.loadTextFromInputFile(event.srcElement, (isSuccess, text) => {
			event.srcElement.value = '';
			if (!isSuccess) {
				App.Component.Loadmask.hide();
				return;
			}
			App.bookToRead(text, true)
		});
	}
};