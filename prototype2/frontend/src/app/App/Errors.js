'use strict';

import App from './Errors/App'
import User from './Errors/User'

export default class Errors {
	static get App() {
		return App;
	}

	static get User() {
		return User;
	}
};