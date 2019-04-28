'use strict';

import App from "../App";
import Nav from './Component/Nav';
import Setlang from './Component/Setlang';
import Statistic from './Component/Statistic';
import Library from './Component/Library';
import Read from './Component/Read';
import Study from './Component/Study';
import Loadmask from './Component/Loadmask';


/**
 * Контейнер для компонент приложения
 */
export default class Component {
	static get App() {
		return App;
	}

	static get Nav() {
		return Nav;
	}

	static get Setlang() {
		return Setlang;
	}

	static get Statistic() {
		return Statistic;
	}

	static get Library() {
		return Library;
	}

	static get Read() {
		return Read;
	}

	static get Study() {
		return Study;
	}

	static get Loadmask() {
		return Loadmask;
	}

	static init() {
		Nav.init();
		Setlang.init();
		Library.init();
		Read.init();
		Study.init();
	}
};