'use strict';
console.log('App.Words');

App.Words = {
	alphabette:{
		ENG : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890\'',
		RUS : 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ1234567890'
	},
	getWords(lang, str) {
		let words = [];
		let word = '';
		let separatorsInclude = ',-';
		let separatorsExclude = ' ';
		let punctuation = '?!.';
		let isPrevAlphabette = true;
		let alphabette = this.alphabette[lang];
		for (let i = 0, len = str.length; i < len; i++) {
			let currChar = str[i];
			if (alphabette.indexOf(currChar) >= 0) {
				if (!isPrevAlphabette) {
					words.push(word);
					word = '';
					isPrevAlphabette = true;
				}
				word += currChar;
				continue;
			}
			if (word !== '') {
				if (isPrevAlphabette) {
					words.push(word);
					word = '';
				}
			}
			if (punctuation.indexOf(currChar) >= 0) {
				if (word !== '') {
					words.push(word);
					word = '';
				}
				words.push(currChar);
				continue;
			}
			if (separatorsInclude.indexOf(currChar) >= 0) {
				if (word !== '') {
					words.push(word);
					word = '';
				}
				words.push(currChar);
				continue;
			}
			if (separatorsExclude.indexOf(currChar) >= 0) {
				if (word !== '') {
					words.push(word);
					word = '';
				}
				continue;
			}
			word += currChar;
			isPrevAlphabette = false;
		}
		if (word !== '') {
			words.push(word);
		}
		return words;
	}
};
