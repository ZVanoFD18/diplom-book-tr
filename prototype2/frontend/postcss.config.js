// npm install postcss-loader autoprefixer css-mqpacker cssnano --save-dev

module.exports = {
	plugins: [
		require('autoprefixer'),
		/**
		 * 'css-mqpacker' для CSS @media
		 * У нас не используется.
		 */
		// require('css-mqpacker'),
		require('cssnano')({
			preset: [
				'default', {
					discardComments: {
						removeAll: true,
					}
				}
			]
		})
	]
};
