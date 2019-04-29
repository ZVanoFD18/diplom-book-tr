// Тестируем преобразоваение ES6 в код, понимаемый IE10, IE11.
console.log('dev-tests');
var array = [1,2,3];

Array.from(array).forEach(($item) => {
	console.log($item);
});

