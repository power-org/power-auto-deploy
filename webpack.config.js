let path = require('path');
let BASE_DIR = path.resolve(__dirname, './');
let BUILD_DIR = path.resolve(__dirname, './dist/');
let APP_DIR = path.resolve(__dirname, './src');

const webpack = require('webpack');

//plugins
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let cleanOptions = {
  root:     BASE_DIR,
  verbose:  true,
  dry:      false
};

const isProduction = (process.env.NODE_ENV ==='production') ? true : false;

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  output: {
    filename: 'js/app.js',
    path: BUILD_DIR
  },
  entry: ['./src/js/index.js','./src/css/index.css'],
  module: {
    rules: [
      {
        test:/\.(s*)css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
          test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
          use: [{
              loader: 'file-loader',
              options: {
                  name: '[name].[ext]',
                  outputPath: 'fonts/'
              }
          }]
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]?[hash]',
          publicPath: `${APP_DIR}/assets/img`,
        },
        include: `${APP_DIR}/assets/img`
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(cleanOptions),
    // new HtmlWebPackPlugin({
    //   title: 'wp4test',
    //   template: './public/index.html',
    //   minify: {
    //     html5: true,
    //     removeComments: isProduction,
    //     collapseWhitespace: isProduction,
    //     preserveLineBreaks: true,
    //     decodeEntities: true,
    //   },
    // }),
    new OptimizeCSSAssetsPlugin({}),
    new webpack.LoaderOptionsPlugin({
      minimize: isProduction
    }),
    new MiniCssExtractPlugin({
      filename: "css/app.css"
    }),
    new webpack.ProvidePlugin({
        'window.jQuery': 'jquery',
        'window.$': 'jquery',
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
    ]
  }
};
