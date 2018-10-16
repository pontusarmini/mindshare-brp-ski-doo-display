const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }, {
        test: /.*\.(gif|png|svg|jpe?g)$/i,
        loaders: [
          'file-loader?name=[name].[ext]', {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true
              },
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 4
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      }, {
        test: /\.(mp4|mpd|m3u8|m4s|ts)$/,
        loader: 'file-loader?name=[name].[ext]'
      },{
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader?name=[name].[ext]'
      },{
        test: require.resolve('./src/modules/springstreams.js'),
        use: 'exports-loader?SpringStreams'
      }
    ]
  }
};
