"use strict";

let format = require('chalk');
let settings = require('../utils/settings');
let session = require('../utils/session');


module.exports = function(options, env) {

  session.instanceLoad();

  session.instance.codebox().list()
    .then((resp) => {
      console.log(resp)
    });

};