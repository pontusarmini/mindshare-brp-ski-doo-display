const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
var JsDocPlugin = require('./jsdoc/jsdoc-plugin');/*require('jsdoc-webpack-plugin-v2');*/

module.exports = merge(common, {
  entry: {
    'app': './jsdoc/js-doc-dummy.js'
  },
  output: {
    filename: 'jsdoc.js',
    path: path.resolve(__dirname, 'documentation/')
  },
  module: {
    rules: []
  },
  plugins: [
    new CleanWebpackPlugin(['documentation']),
    new JsDocPlugin({
      conf: path.join(__dirname, 'jsdoc.json'),
    }),
    new WebpackShellPlugin({onBuildStart:['echo "Webpack Start"'], onBuildEnd:['node postbuild']})
  ]
});
