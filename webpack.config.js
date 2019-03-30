const webpack = require('webpack');
module.exports = function (env, argv) {
	let config = {
		context: __dirname + '/prototype',
		/*
			entry : {
				main : './app/js/App.js'
			},
			output : {
				path : __dirname + '/public',
				publicPath : '/',
				filename : '[name].js'
			},
		*/
		plugins: [
			new webpack.ProgressPlugin()
		],
		devServer: {
			host: 'localhost',
			port: '8088',
			contentBase: __dirname + '/prototype'
		}
	};
	return config;
};
