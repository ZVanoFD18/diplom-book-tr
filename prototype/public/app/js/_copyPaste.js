App.Component.Loadmask.show('Загрузка...');
App.Component.Loadmask.hide();

App.Component.WinMsg.show({
	title: '<span style="color: red;">Ошибка.</span>',
	//title: 'Уведомление!',
	message: 'Ля-ля-ля, зае...ли тополя, <br>пух их злое...чий<hr>собирается м...ть в кучи.',
	textButtonClose: 'Ознакомлен',
	callback: () => {
		console.log('OK');
	}
});


