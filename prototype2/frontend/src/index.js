import './main/dev-tests';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
//import '@fortawesome/fontawesome-free/js/regular';
//import '@fortawesome/fontawesome-free/js/brands';

// import '@babel/polyfill';

import './css/reset.css';

// Импорт корневых модулей
import Helper from './main/Helper';
import App from './main/App';

/**
 * Финт ушами - ранее суперглобальные переменные в webpack становятся локальными.
 * Хардкорно публикуем в document.
 * @TODO: Разобраться как в webpack 4 публиковать отдельные переменные в глобальную область видимости и как их использовать.
 * @type {Helper}
 */
document.Helper = Helper;
document.App = App;

// Запуск приложения
App.run();

