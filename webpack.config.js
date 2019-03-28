module.exports = {
	context : __dirname + '/prototype',
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
	devServer : {
		host : 'localhost',
		port : '8088',
		contentBase : __dirname + '/prototype'
	}
}
