"use strict";

require('babel-register');
let babel = require("babel-core");

let fs = require('fs');
let format = require('chalk');
var inquirer = require("inquirer");
var watchr = require('watchr');
var mkdirp = require('mkdirp');
let path = require('path');

let session = require('../utils/session');
let helpers = require('./helpers');
let settings = require('../utils/settings');


function requireFromString(src, filename) {
  var m = new module.constructor();
  m.paths = module.paths;
  m._compile(src, filename);
  return m.exports;
}


function createFullCodeBox(fileName, source, config) {
  process.stdout.write('Creating Syncano CodeBox...');
  let instance = settings.project.get('name');
  let name = fileName.split('/').pop();

  helpers.createCodeBox({instance: instance, source: source, config: config, name: name})
    .then((cb) => {
      return helpers.createWebhook({name: name, CodeBoxId: cb.id, instance: instance})
    })
    .then((wh)=> {
      helpers.saveToMap({name: name, CodeBoxId: wh.codebox, WebhookName: wh.name});
      console.log(format.green('Done'));
    });
}

function updateCodeBox(fileName, source, config) {
  process.stdout.write('Updating Syncano CodeBox...');
  let instance = settings.project.get('name');
  let name = fileName.split('/').pop();
  let id = settings.project.get('cbMap')[name].CodeBoxId;

  helpers.updateCodeBox({instance: instance, id: id, source: source, config: config, name: name})
    .then(() => {
      console.log(format.green('Done'));
    })
    .catch((cb) => {
      console.log(cb);
    })
}

function deleteFullCodeBox(fileName) {
  process.stdout.write('Deleting Syncano CodeBox...');
  let instance = settings.project.get('name');
  let name = fileName.split('/').pop();
  let id = settings.project.get('cbMap')[name].CodeBoxId;
  let WebhookName = settings.project.get('cbMap')[name].WebhookName;

  helpers.deleteCodeBox({instance: instance, id: id})
    .catch((cb) => {
      console.log(cb);
    });

  helpers.deleteWebhook({instance: instance, name: WebhookName})
    .catch((resp) => {
      console.log(resp);
    });

  // Fix that
  helpers.deleteFromMap(name);
  console.log(format.green('Done'));
}

module.exports = function() {
  //console.log('Watch our paths', settings.project.get('CodeBoxFolder'));

  session.instanceLoad();

  //watchr.watch({
  //  paths: [settings.project.get('CodeBoxFolder')],
  //  listeners: {
  //
  //    change: function(changeType, fileName) {
  //      if (changeType == 'create') {
  //        createFullCodeBox(fileName, fs.readFileSync(fileName).toString(), '');
  //      }
  //      if (changeType == 'update') {
  //        updateCodeBox(fileName, fs.readFileSync(fileName).toString(), '');
  //      }
  //      if (changeType == 'delete') {
  //        deleteFullCodeBox(fileName)
  //      }
  //    }
  //  }
  //});

  console.log('Watch our paths', path.join('./', settings.project.get('srcFolder'), 'syncano/classes'));
  watchr.watch({
    path: path.join('syncano/classes'),
    //preferredMethods: ['watchFile', 'watch'],
    listeners: {
      error: function(err) {
        console.log('an error occured:', err);
      },
      change: function(changeType, fileName) {

        console.log(process.cwd());
        if (changeType == 'update') {

          let syncano = require(path.join(process.cwd(), '/syncano'));
          console.log(syncano.class('example'));
          //babel.transformFile(fileName, {presets: ['es2015']}, function(err, result) {
          //
          //  let mod = requireFromString(result.code);
          //  let classMap = settings.project.get('classMap');
          //
          //  if (!classMap) {
          //    classMap = {};
          //  }
          //
          //  // Delete non-existing classes
          //  Object.keys(classMap).forEach((syncanoClass) => {
          //    if (Object.keys(mod).indexOf(syncanoClass) < 0) {
          //      process.stdout.write(`Deleting Class ${syncanoClass}... `);
          //      delete classMap[syncanoClass];
          //
          //      helpers.deleteClass(syncanoClass)
          //        .then(() => {
          //          settings.project.set('classMap', classMap).save();
          //          console.log(format.green('Done'));
          //        });
          //
          //    }
          //  });
          //
          //  Object.keys(mod).forEach((syncanoClass) => {
          //    // Looking for changes
          //    if (JSON.stringify(classMap[syncanoClass]) != JSON.stringify(mod[syncanoClass].schema())) {
          //
          //      let updateType = 'update';
          //
          //      if (!classMap[syncanoClass]) {
          //        updateType = 'create';
          //      }
          //
          //      classMap[syncanoClass] = mod[syncanoClass].schema();
          //      settings.project.set('classMap', classMap).save();
          //
          //      if (updateType == 'create') {
          //        process.stdout.write(`Creating Class ${syncanoClass}... `);
          //        helpers.createClass(syncanoClass);
          //      } else {
          //        process.stdout.write(`Updating Class ${syncanoClass}... `);
          //        helpers.updateClass(syncanoClass);
          //      }
          //
          //      console.log(format.green('Done'));
          //
          //    }
          //  })

          //});

        }
      }
    }
  })

};