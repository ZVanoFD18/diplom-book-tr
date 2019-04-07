console.log('Helper');
Helper = {};
Helper.emptyFn = () => {
};
Helper.isArray = function (value) {
	return Array.isArray(value);
};

Helper.isBoolean = function (value) {
	return typeof value === 'boolean';
};

Helper.isNumber = function (value) {
	return typeof value === 'number' && isFinite(value);
};

Helper.isObject = function (value) {
	return typeof(value) === 'object';
};

Helper.isString = function (value) {
	return typeof(value) === 'string';
};

Helper.isDefined = function (value) {
	return typeof value !== 'undefined';
};

Helper.isFunction = function (value) {
	return typeof value === 'function';
};

Helper.isEmpty = (value) => {
	if (!Helper.isDefined(value)) {
		return false;
	} else if (Helper.isString(value)) {
		return value === '';
	}
	return false;
};
