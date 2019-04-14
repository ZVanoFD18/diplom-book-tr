'use strict';
console.log('App.Errors.App');
/**
 * Ошибкм приложения.
 * Пользователю не показываем, а сообщааем серверу в фоне.
 * @type {App.Errors.App}
 */
App.Errors.App = class extends Error {
};
