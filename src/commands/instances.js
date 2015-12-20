"use strict";

let format = require('chalk');
let settings = require('../utils/settings');
let session = require('../utils/session');

module.exports = function() {

  session.connection.instance().list()
    .then((resp) => {
      console.log(`\nYou have ${format.bold(resp.objects.length)} instances:\n`);

      resp.objects.forEach((instance) => {
        console.log(`   ${format.bold(instance.name)}`);
        if (instance.description) {
          console.log(`   ${instance.description}`);
        }
        console.log();
      })
    })
};