const helpers = require('./config/helpers');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    resolve: {
        extensiosn: ['.ts', '.js']
    },
    entry: helpers.root('index.ts'),
    output: {
        path: helpers.root('bundles'),
        publicPath: '/',
        filename: 'json-api.umd.js',
        libraryTarget: 'umd'
    },
    externals: [/^\@angular\//, /^rxjs\//],
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts$/,
                loader: 'tslint-loader',
                exclude: [helpers.root('node_modules')]
            },
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    declaration: false
                },
                exclude: [/\.spec\.ts$/]
            }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src')
        ),

        new webpack.LoaderOptionsPlugin({
            options: {
                tslintLoader: {
                    emitErrors: false,
                    failOnHint: false
                }
            }
        }),

        new CleanWebpackPlugin(
            ['bundles'],
            {
                root: helpers.root(),
                verbose: false,
                dry: false
            }
        )
    ]
};
