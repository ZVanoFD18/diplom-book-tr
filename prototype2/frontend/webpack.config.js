'use strict';
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let config = {
	mode: 'development',
	// "devServer": {
	// 	"contentBase": './dist',
	// 	port: 8080
	// },
	devtool: 'source-map',
	//devtool: '(none)',
	context: path.resolve(__dirname),
	watch: false,
	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules|fonts)/,
			include: path.resolve(__dirname, 'src/js'),
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: ['@babel/plugin-proposal-object-rest-spread']
				}
			}
		}]
	},
	plugins: [
		new CleanWebpackPlugin({
			verbose: true,
		}),
		// new MiniCssExtractPlugin({
		// 	filename: "./css/style.bundle.css"
		// }),
		new CopyWebpackPlugin([{
			from: "./src/fonts",
			to: "./fonts"
		}, {
			from: "./src/favicon.ico",
			to: "./favicon.ico"
		}, {
			from: "./src/img",
			to: "./img"
		}, {
			from: "./src/data",
			to: "./data"
		}]),
		new HtmlWebpackPlugin({
			inject: false,
			hash: true,
			template: './src/index.html',
			filename: 'index.html'
		})
	]
};

module.exports = (env, argv) => {
	if (argv.mode === "production") {
		// config.plugins.push(new CleanWebpackPlugin());
	}
	return config;
};