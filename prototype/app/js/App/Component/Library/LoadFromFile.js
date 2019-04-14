'use strict';
console.log('App.Component.Library.LoadFromFile');

/**
 * Компонент, позволяющий выбрать файл для чтения с диска.
 */
App.Component.Library.LoadFromFile = {
	elInput : undefined,
	init(){
		this.elInput = document.querySelector('input[name="inpFile"]');
		document.querySelector('.library-loadfromfile-button').addEventListener('click', this.onInputButtonClick.bind(this));
		this.elInput.addEventListener('change', this.onInputFileChange.bind(this));
	},
	onInputButtonClick (){
		this.elInput.click();
	},
	onInputFileChange(event) {
		App.Component.Loadmask.show(App.localize('Загрузка файла...'));
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