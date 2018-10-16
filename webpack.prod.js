const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');


const merged = merge(common, {
  module: {
    rules: [
      {
        test: /\.(sass|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      }
    ]
  }
});

const mobileSkiDoo1 = Object.assign({}, merged, {
  entry: {
    'app': './src/320x400-1.js'
  },
  output: {
    filename: '[name].[hash:6].js',
    path: path.resolve(__dirname, 'dist_320x400_1/')
  },

  plugins: [
    new CleanWebpackPlugin(['dist_320x400_1']),
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      template: 'src/320x400-1.ejs',
      chunks: ['app'],
      minify: {
            'collapseWhitespace': true
      },
      baseRef: 'https://ibv.streamedby.com/mindshare/ski-doo/skads/dist_320x400_1/'
    }),
    new ExtractTextPlugin('[name].[hash:6].css'),
    new WebpackShellPlugin({onBuildStart:['echo "Webpack Start"'], onBuildEnd:['node postbuild']})
  ]
});

const mobileSkiDoo2 = Object.assign({}, merged, {
  entry: {
    'app': './src/320x400-2.js'
  },
  output: {
    filename: '[name].[hash:6].js',
    path: path.resolve(__dirname, 'dist_320x400_2/')
  },

  plugins: [
    new CleanWebpackPlugin(['dist_320x400_2']),
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      template: 'src/320x400-2.ejs',
      chunks: ['app'],
      minify: {
            'collapseWhitespace': true
      },
      baseRef: 'https://ibv.streamedby.com/mindshare/ski-doo/skads/dist_320x400_2/'
    }),
    new ExtractTextPlugin('[name].[hash:6].css'),
    new WebpackShellPlugin({onBuildStart:['echo "Webpack Start"'], onBuildEnd:['node postbuild']})
  ]
});

const desktopSkiDoo1 = Object.assign({}, merged, {
  entry: {
    'app': './src/980x600-1.js'
  },
  output: {
    filename: '[name].[hash:6].js',
    path: path.resolve(__dirname, 'dist_980x600_1/')
  },

  plugins: [
    new CleanWebpackPlugin(['dist_980x600_1']),
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      template: 'src/980x600-1.ejs',
      chunks: ['app'],
      minify: {
            'collapseWhitespace': true
      },
      baseRef: 'https://ibv.streamedby.com/mindshare/ski-doo/skads/dist_980x600_1/'
    }),
    new ExtractTextPlugin('[name].[hash:6].css'),
    new WebpackShellPlugin({onBuildStart:['echo "Webpack Start"'], onBuildEnd:['node postbuild']})
  ]
});

const desktopSkiDoo2 = Object.assign({}, merged, {
  entry: {
    'app': './src/980x600-2.js'
  },
  output: {
    filename: '[name].[hash:6].js',
    path: path.resolve(__dirname, 'dist_980x600_2/')
  },

  plugins: [
    new CleanWebpackPlugin(['dist_980x600_2']),
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      template: 'src/980x600-2.ejs',
      chunks: ['app'],
      minify: {
            'collapseWhitespace': true
      },
      baseRef: 'https://ibv.streamedby.com/mindshare/ski-doo/skads/dist_980x600_2/'
    }),
    new ExtractTextPlugin('[name].[hash:6].css'),
    new WebpackShellPlugin({onBuildStart:['echo "Webpack Start"'], onBuildEnd:['node postbuild']})
  ]
});

module.exports = [
  mobileSkiDoo1,
  mobileSkiDoo2,
  desktopSkiDoo1,
  desktopSkiDoo2
]
//ffmpeg -i input-video.avi -vn -acodec copy new-fullscreen.aac
