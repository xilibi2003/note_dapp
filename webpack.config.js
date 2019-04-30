const webpack = require('webpack')
var path = require('path')

module.exports = {
    // context: __dirname + '/src',
    // entry: ['regenerator-runtime/runtime', './index'],
    entry: {
        app: path.join(__dirname, 'src', 'index.js')
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devServer: {
        historyApiFallback: true
    },
    // module: {
    //     rules: [{
    //         test: /\.js$/,
    //         exclude: /node_modules/,
    //         loader: 'babel-loader'
    //     }]
    // },
    node: {
        fs: 'empty',
        child_process: 'empty',
        crypto: true,
        util: true,
        stream: true,
        path: 'empty',
    },
    externals: {
        shelljs: 'commonjs shelljs',
    },
    optimization: {
        minimizer: []
    }
}