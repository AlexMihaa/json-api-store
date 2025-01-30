module.exports = function(config) {
    var testWebpackConfig = require('./webpack.test.js');

    var configuration = {
        basePath: '',
        frameworks: ['jasmine', 'webpack'],
        exclude: [],
        files: [ { pattern: './config/spec-bundle.js', watched: false } ],
        preprocessors: { './config/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },
        webpack: testWebpackConfig,
        coverageReporter: {
            type: 'in-memory',
            dir: './coverage',
            reporters: [
                { type: 'html', subdir: 'html' },
                { type: 'json', subdir: '.', file: 'coverage.json' },
                { type: 'text-summary' }
            ]
        },
        remapCoverageReporter: {
            'text-summary': null,
            json: './coverage/coverage.json',
            html: './coverage/html'
        },

        // Webpack please don't spam the console when running in karma!
        webpackMiddleware: {
            stats: 'minimal',
            logLevel: 'warn'
        },
        failOnEmptyTestSuite: false,
        reporters: [ 'mocha', 'coverage' ],
        mochaReporter: {
            ignoreSkipped: true
        },
        // web server port
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: [
            'ChromeHeadlessCustom'
        ],
        customLaunchers: {
            ChromeHeadlessCustom: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
            }
        },
        singleRun: true,
        browserConsoleLogOptions: {
            level: 'log',
            format: '%b %T: %m',
            terminal: true
        }
    };

    config.set(configuration);
};
