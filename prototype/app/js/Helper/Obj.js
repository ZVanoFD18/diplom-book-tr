'use strict';
console.log('Helper.Obj');
/**
 *
 * @type {Object}
 */
Helper.Obj = {};

/**
 * Копирует свойства из одного объекта в другой.
 * @param {Object} targetObj - Целевой объект. В него заливаются свойства.
 * @param {Object} sourceObj - Объект-источник. Из него извлекаются свойства.
 * @param {Boolean} isRecursive - Флаг, определяющий алгоритм работы со свойствами-объектами.
 * Если false, то свойство будет скопировано (как новый объект, т.е. на выходе не ссылка).
 * Если true, то к свойствам targetObj будут подмешаны свойства из sourceObj.
 */
Helper.Obj.apply =  (targetObj, sourceObj, isRecursive) => {
	isRecursive = isRecursive || false;
	for (let key in sourceObj) {
		if (Helper.isObject(sourceObj[key])) {
			if (isRecursive) {
				Helper.Obj.apply(targetObj[key], sourceObj[key]);
			} else {
				targetObj[key] = Object.assign({}, sourceObj[key]);
			}
			continue;
		}
		targetObj[key] = sourceObj[key];
	}
};

/**
 * Переопределяет значения свойств targetObj значениями из sourceObj.
 * При этом свойство должно присутствовать в targetObj.
 * Если свойство не найдено в targetObj и включен режим isStrict, то генерируется исключение.
 * @param targetObj
 * @param sourceObj
 * @param isStrict
 */
Helper.Obj.replaceMembers = (targetObj, sourceObj, isStrict) => {
	isStrict = isStrict === undefined ? true : isStrict;
	for (let key in sourceObj) {
		if (key in targetObj) {
			targetObj[key] = sourceObj[key];
		} else if (isStrict) {
			throw new Error('Поле "' + key + '" не найдено в целевом объекте');
		}
	}
	return targetObj;
};

/**
 * Возвращает в виде массива занчения полей оюбъектов, которые переданы в массиве "arrOfObject".
 * @param arrOfObject
 * @param findFieldName
 * @return {Array}
 */
Helper.Obj.getFieldsAsArray = (arrOfObject, findFieldName) => {
	let result = [];
	arrOfObject.forEach((obj)=>{
		if (!Helper.isObject(obj)){
			return;
		}
		if (findFieldName in obj){
			result.push(obj[findFieldName]);
		}
	});
	return result;
};

/**
 * Ищет в массиве объектов "arrOfObject" 1й элемент, у которого поле "findFieldName"
 * содержит значение "findFieldValue".
 * Если найдено, возвращает найденный элемент.
 * Если не найдено, возвращает "defValue"
 * @param arrOfObject
 * @param findFieldName
 * @param findFieldValue
 * @param defValue
 * @return {*}
 */
Helper.Obj.getObjectFromArray = (arrOfObject, findFieldName, findFieldValue, defValue = undefined) => {
	for (let i = 0, arrLength = arrOfObject.length; i < arrLength; i++) {
		if (arrOfObject[i][findFieldName] === findFieldValue) {
			return arrOfObject[i];
		}
	}
	return defValue;
};