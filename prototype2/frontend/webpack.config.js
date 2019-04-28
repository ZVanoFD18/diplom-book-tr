'use strict';
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
			test: /.src\/js\/\.*\.js$/,
			exclude: /(node_modules)/,
			// include: path.resolve(__dirname, 'src/js'),
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: ['@babel/plugin-proposal-object-rest-spread']
				}
			}
		}
			// , {
			// 	test: /\.css$/,
			// 	loader: 'css-loader',
			// 	options: {
			// 		sourceMap: true,
			// 	}
			// }
			,
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader"
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin({
			verbose: true,
		}),
		// new MiniCssExtractPlugin({
		// 	filename: "./css/style.bundle.css"
		// }),

		new MiniCssExtractPlugin({
			filename: "[name].css"
			//chunkFilename: "[id].css"
		}),

		new CopyWebpackPlugin([
			{
				from: "./src/fonts",
				to: "./fonts"
			},
			{
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
			template: './src/index.tpl.html',
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