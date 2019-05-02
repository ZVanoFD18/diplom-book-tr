'use strict';
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let config = {
	//mode: 'development',
	mode: 'production',
	performance: {
		hints: false
	},
	"devServer": {
		contentBase: './dist',
		host : '0.0.0.0',
		port: 8080,
		overlay: {
			warnings: true,
			errors: true
		}
	},
	devtool: 'source-map',
	//devtool: '(none)',
	context: path.resolve(__dirname),
	watch: false,
	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000
	},
	entry: {
		bootstrap : [
			"detect-browser",
			"semver",
			'./src/entry-bootstrap.js'
		],
		app : [
			'./src/entry-app.js'
		],
		polyfill : [
			"core-js",
			"@babel/polyfill",
			'./src/entry-polyfill.js'
		],
		fonts : [
			"@fortawesome/fontawesome-free",
			'./src/entry-fonts.js'
		]
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				//exclude: /node_modules/,
				include: path.resolve(__dirname, 'src/app'),
				//include: path.resolve(__dirname, 'src'),
				use: {
					loader: 'babel-loader',
				}
			}
			,
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					}, {
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							config: {
								path: 'postcss.config.js'
							}
						}
					}
				]
			}
		]
	},
	plugins: [
		/**
		 * CleanWebpackPlugin - не используем, пока не найдем способ избежать
		 * очистки при запуске webpack-dev-server.
		 *
		 */
		// new CleanWebpackPlugin({
		// 	// verbose: true,
		// })
		// ,
		new MiniCssExtractPlugin({
			filename: "[name].css"
			//chunkFilename: "[id].css"
		})
		,
		new HtmlWebpackPlugin({
			inject: false,
			hash: true,
			template: './src/index.tpl.html',
			filename: 'index.html'
		})
		,
		new CopyWebpackPlugin([
			{
				from: "./src/favicon.ico",
				to: "./favicon.ico"
			}
			,
			{
				from: "./src/img",
				to: "./img"
			}
			,
			{
				from: "./src/data",
				to: "./data"
			}
			,
			{
				from: "./src/books",
				to: "./books"
			}
		])

	]
};

module.exports = (env, argv) => {
	if (argv.mode === "production") {
		// config.plugins.push(new CleanWebpackPlugin());
	}
	return config;
};