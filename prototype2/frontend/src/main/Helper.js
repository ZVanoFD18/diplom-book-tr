import Ajax from './Helper/Ajax';
import Fb2 from './Helper/Fb2';
import Google from './Helper/Google';
import Hash from './Helper/Hash';
import Io from './Helper/Io';
import Log from './Helper/Log';
import Obj from './Helper/Obj';
import Text from './Helper/Text';
import Xml from './Helper/Xml';

class Helper {
	/** ----------------------------------------------
	 *  Внешние методы
	 */
	static get Ajax() {
		return Ajax;
	}

	static get Fb2() {
		return Fb2;
	}

	static get Google() {
		return Google;
	}

	static get Hash() {
		return Hash;
	}

	static get Io() {
		return Io;
	}

	static get Log() {
		return Log;
	}

	static get Obj() {
		return Obj;
	}

	static get Text() {
		return Text;
	}

	static get Xml() {
		return Xml;
	}

	/** ----------------------------------------------
	 *  Собственные методы
	 */

	static emptyFn() {
	}

	static isArray(value) {
		return Array.isArray(value);
	}

	static isBoolean(value) {
		return typeof value === 'boolean';
	}

	static isNumber(value) {
		return typeof value === 'number' && isFinite(value);
	}

	static isObject(value) {
		return typeof(value) === 'object';
	}

	static isString(value) {
		return typeof(value) === 'string';
	}

	static isDefined(value) {
		return typeof value !== 'undefined';
	}

	static isNull(value) {
		return value === null;
	}

	static isFunction(value) {
		return typeof value === 'function';
	}

	static isEmpty(value) {
		if (!Helper.isDefined(value)) {
			return false;
		} else if (Helper.isString(value)) {
			return value === '';
		}
		return false;
	}
}

// ES5
//module.exports = Helper

// ES6
export default Helper;
