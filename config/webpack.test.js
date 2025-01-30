const path = require('path');
const { ContextReplacementPlugin } = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

const ROOT = path.resolve(__dirname, '..');

function root(args) {
    return path.join.apply(path, [ROOT].concat(args));
}
/**
 * Webpack Plugins
 */

module.exports = {

    /**
     * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
     *
     * Do not change, leave as is or it wont work.
     * See: https://github.com/webpack/karma-webpack#source-maps
     */
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [root('src'), 'node_modules']
    },

    module: {
        rules: [
        //     {
        //     enforce: 'pre',
        //     test: /\.ts$/,
        //     loader: 'eslint-loader',
        //     exclude: [helpers.root('node_modules')]
        // },
            {
            enforce: 'pre',
            test: /\.js$/,
            loader: 'source-map-loader',
            exclude: [
                root('node_modules/rxjs'),
                root('node_modules/@angular'),
            ]
        }, {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
                // use inline sourcemaps for "karma-remap-coverage" reporter
                transpileOnly: true,
                compilerOptions: {
                    module: "commonjs",
                    removeComments: true
                }
                // sourceMap: false,
                // inlineSourceMap: true,
                // module: "commonjs",
                // removeComments: true
            },
            exclude: [/\.e2e\.ts$/]
        },
        //     {
        //     enforce: 'post',
        //     test: /\.(js|ts)$/,
        //     loader: 'istanbul-instrumenter-loader',
        //     include: helpers.root('src'),
        //     exclude: [/\.spec\.ts$/, /\.e2e\.ts$/, /node_modules/]
        // }
        ]
    },

    plugins: [
        // fix the warning in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
        new ContextReplacementPlugin (
            /angular(\\|\/)core(\\|\/)@angular/,
            root('./src')
        ),
        new ESLintPlugin({
            extensions: ['ts', 'js'], // Проверяем только файлы .ts и .js
            failOnError: false,
            fix: true, // Автоматическое исправление ошибок
            context: root('.')
        }),

        // new LoaderOptionsPlugin({
        //     debug: true,
        //     options: {
        //
        //         /**
        //          * Static analysis linter for TypeScript advanced options configuration
        //          * Description: An extensible linter for the TypeScript language.
        //          *
        //          * See: https://github.com/wbuchwalter/tslint-loader
        //          */
        //         tslint: {
        //             emitErrors: false,
        //             failOnHint: false,
        //             resourcePath: 'src'
        //         }
        //     }
        // })
    ],

    // disable warnings about bundle size for tests
    performance: {hints: false}
};
