// Импорт корневых модулей
import Helper from './js/Helper';
import App from './js/App';

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

