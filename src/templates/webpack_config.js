module.exports = () => {
  return {
    path: 'webpack.config.js',
    data: `\
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: __dirname,
    filename: "../src/syncano.js",
    libraryTarget: "var",
    library: "Syncano"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json'
      }
    ]
  }
};
`}
};
