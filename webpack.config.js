const webpack = require('webpack');
const path = require('path');
const PACKAGE = require('./package.json');
const banner =
`
${PACKAGE.name} - ${PACKAGE.version} | ${PACKAGE.license}
(c) 2014 - ${new Date().getFullYear()} ${PACKAGE.author} | ${PACKAGE.homepage}
`;

module.exports = {
    entry: './src/gh-widget-init.ts',
    output: {
        filename: 'gh-profile-card.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.BannerPlugin(banner),
    ],
    mode: 'production',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
};
