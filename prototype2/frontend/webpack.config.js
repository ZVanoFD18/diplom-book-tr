'use strict';
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let config = {
	mode: 'development',
	"devServer": {
		contentBase: './dist',
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
	// entry: './src/index.js',
	entry: {
		main : [
			"@babel/polyfill",
			'./src/index.js'
		]
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				//include: path.resolve(__dirname, 'src/js'),
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
		new CleanWebpackPlugin({
			// verbose: true,
		})
		,
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
			// {
			// 	from: "./src/fonts",
			// 	to: "./fonts"
			// }
			// ,
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
		])

	]
};

module.exports = (env, argv) => {
	if (argv.mode === "production") {
		// config.plugins.push(new CleanWebpackPlugin());
	}
	return config;
};