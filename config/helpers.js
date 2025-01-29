const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function root(...args) {
    return path.join(ROOT, ...args);
}

function hasProcessFlag(flag) {
    return process.argv.join('').includes(flag);
}

function isWebpackDevServer() {
    return process.argv[1] && /webpack-dev-server$/.test(process.argv[1]);
}

module.exports = {
    root,
    hasProcessFlag,
    isWebpackDevServer,
};
