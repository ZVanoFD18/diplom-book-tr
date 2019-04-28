'use strict';
export default class Google {
	static getTranslateConverted(googleStruct) {
		let result = {
			wordLang: undefined,
			word: undefined,
			translate: undefined,
			score: undefined
		};
		result.wordLang = googleStruct.data[2];
		result.word = googleStruct.data[0][0][1];
		result.translate = googleStruct.data[0][0][0];
		result.score = googleStruct.data[6];
		return result;
	}

	static translate(translateTo, text, translateFrom = 'auto') {
		return new Promise((resolve, reject) => {
			const url = "https://translate.googleapis.com/translate_a/single?"
				+ "client=gtx"
				+ "&sl=" + translateFrom
				+ "&tl=" + translateTo
				+ "&dt=t"
				+ "&q=" + encodeURI(text);

			fetch(url).then(response => {
				response.json().then(data => {
					resolve({
						word: data[0][0][0],
						data: data
					})
				}, reject)
			}, reject)
		});
	}

	/**
	 * @TODO: Разобраться почему не работает
	 * @param options
	 */
	static translateXhr(options) {
		if (typeof(options) !== 'object') {
			throw new Error('options - не объект');
		}
		let xhr = new XMLHttpRequest();
		// single?client=gtx&sl=auto&dt=t&dt=bd&dj=1&text={{some%20tex}}t&tl=ru
		let formData = new FormData();
		formData.append('client', 'gtx');
		formData.append('sl', 'auto');
		formData.append('dt', 't');
		formData.append('dt', 'bd');
		formData.append('dj', '1');
		formData.append('tl', 'ru');
		formData.append('text', options.word);
		let url = 'https://translate.googleapis.com/translate_a/single';
		let urlGet = url + '?';
		for (var pair of formData.entries()) {
			//console.log(pair[0]+ ', '+ pair[1]);
			urlGet += ((urlGet.substr(-1, 1) === '?' ? '' : '&') + encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]));
		}
		xhr.open('GET', urlGet);
		//xhr.responseType = 'arraybuffer';
		xhr.withCredentials = true;
		xhr.setRequestHeader('Destination', url);
		xhr.setRequestHeader("Access-Control-Allow-Headers", "*");
		// xhr.setRequestHeader("Origin", "http://localhost");
		//xhr.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		xhr.send(formData);
		xhr.upload.onload = () => {
			alert('aaa')
		};
		xhr.addEventListener('readystatechange', function () {
			if (xhr.readyState !== 4) {
				return;
			}
			console.log('readystatechange4 arguments', arguments);
			var header = xhr.getResponseHeader('Content-Disposition');
			let type = xhr.getResponseHeader('Content-Type');
			// debugger;
			alert('@TODO: Как читать ответ, который приходит в заголовке <content-disposition: attachment; filename="f.txt">')
			xhr.upload.onload = () => {
				alert('aaa')
			};
			//let json = JSON.parse(xhr.responseText);
			//console.log('google result', json);
		});
		// xhr.onload = function () {
		//     var header = xhr.getResponseHeader('Content-Disposition');
		//     var startIndex = header.indexOf("filename=") + 10; // Adjust '+ 10' if filename is not the right one.
		//     var endIndex = contentDisposition.length - 1; //Check if '- 1' is necessary
		//     var filename = contentDisposition.substring(startIndex, endIndex);
		//     console.log("filename: " + filename)
		// }
	}
};
