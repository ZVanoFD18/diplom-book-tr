'use strict';
/**
 *
 * @type {{}}
 */
Helper.Object = {};

/**
 * Копирует свойства из одного объекта в другой.
 * @param {Object} targetObj - Целевой объект. В него заливаются свойства.
 * @param {Object} sourceObj - Объект-источник. Из него извлекаются свойства.
 * @param {Boolean} isRecursive - Флаг, определяющий алгоритм работы со свойствами-объектами.
 * Если false, то свойство будет скопировано (как новый объект, т.е. на выходе не ссылка).
 * Если true, то к свойствам targetObj будут подмешаны свойства из sourceObj.
 */
Helper.Object.apply = function (targetObj, sourceObj, isRecursive) {
	isRecursive = isRecursive || false;
	for (let key in sourceObj) {
		if (Helper.isObject(sourceObj[key])) {
			if (isRecursive) {
				Helper.Object.apply(targetObj[key], sourceObj[key]);
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
Helper.Object.replaceMembers = function (targetObj, sourceObj, isStrict) {
	isStrict = isStrict === undefined ? true : isStrict;
	for (let key in sourceObj) {
		if (key in targetObj) {
			targetObj[key] = sourceObj[key];
		} else if (isStrict) {
			throw new Error('Поле "' + key + '" не найдено в целевом объекте');
		}
	}
};