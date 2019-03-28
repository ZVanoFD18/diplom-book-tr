'use strict';
/**
 * Io - Input|Output
 * @type {{}}
 */
Helper.Io = {};
Helper.Io.loadTextFromInputFile = function (elFile, callback) {
	let files = elFile.files;
	let reader = new FileReader();
	reader.onload = (e) => {
		callback(true, e.target.result);
	};
	reader.onerror = () => {
		callback(false);
	};
	reader.readAsText(files[0]);
};