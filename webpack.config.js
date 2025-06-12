const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui/index.ts',     // Entry for UI code
    code: './src/plugin/code.ts', // Entry for Plugin code
  },

  module: {
    rules: [
      {
        test: /\.ts$/, // Only target .ts files, no .tsx
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Add loaders for CSS if you want to bundle CSS files
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader'],
      // },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'], // Only resolve .ts and .js
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },

  plugins: [
    // Generates ui.html from the template
    new HtmlWebpackPlugin({
      template: './src/ui/index.html',
      filename: 'ui.html',
      chunks: ['ui'], // Only include the 'ui' entry chunk
      cache: false,
    }),
    // Inlines the compiled 'ui' JavaScript into ui.html
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),
  ],
});