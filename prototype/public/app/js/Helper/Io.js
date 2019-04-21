'use strict';
/**
 * Io - Input|Output
 * @type {{}}
 */
Helper.Io = {};
Helper.Io.loadTextFromInputFile = function (elFile) {
	return new Promise((resolve, reject) => {
		let files = elFile.files;
		let reader = new FileReader();
		reader.onload = (e) => {
			resolve(e.target.result);
		};
		reader.onerror = () => {
			reject();
		};
		reader.readAsText(files[0]);
	});
};
