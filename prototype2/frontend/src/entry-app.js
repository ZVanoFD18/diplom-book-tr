
import './css/reset.css';

// Импорт корневых модулей
import Helper from './app/Helper';
import App from './app/App';

/**
 * Финт ушами - ранее суперглобальные переменные в webpack становятся локальными.
 * Хардкорно публикуем в document.
 * @TODO: Переделать использование суперглобальных переменных на импорт модулей.
 * @type {Helper}
 */
document.Helper = Helper;
document.App = App;

// Запуск приложения
App.run();

