module.exports = () => {
  return {
    path: 'package.json',
    data: `\
{
  "name": "syncano-conf",
  "version": "0.0.1",
  "main": "index.js",
  "dependencies": {
    "babel-core": "^6.3.21",
    "babel-loader": "^6.2.0",
    "babel-preset-es2015": "^6.3.13",
    "json-loader": "^0.5.4",
    "syncano-cli": "file:///Users/qk/Documents/syncano/new/syncano-cli",
    "webpack": "^1.12.9"
  },
  "devDependencies": {
    "babel-core": "^6.3.21",
    "babel-loader": "^6.2.0",
    "babel-plugin-transform-es2015-arrow-functions": "^6.3.13",
    "babel-preset-es2015": "^6.3.13",
    "babel-preset-stage-2": "^6.3.13"
  },
  "scripts": {
    "watch": "babel -w -d lib/ src/",
    "build": "babel -d lib/ src/"
  },
  "babel": {
    "presets": [
      "es2015"
    ]
  }
}
`}
};

