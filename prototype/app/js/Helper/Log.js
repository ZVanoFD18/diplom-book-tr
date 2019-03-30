Helper.Log = {};

Helper.Log.addDebug = function (msg, place) {
	console.log('@DEBUG:', {
		msg : msg,
		place : place || new Error().stack
	})
};

Helper.Log.addTodo = function (msg, place) {
	console.log('@TODO:', {
		msg : msg,
		place : place || new Error().stack
	})
};