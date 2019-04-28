export default class Log {
	static addDebug(msg, place) {
		console.log('@DEBUG:', {
			msg: msg,
			place: place || new Error().stack
		})
	};

	static addTodo(msg, place) {
		console.log('@TODO:', {
			msg: msg,
			place: place || new Error().stack
		});
	};
};


