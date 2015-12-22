"use strict";

let debug = require('debug')('init');
let fs = require('fs');
let path = require('path');
let format = require('chalk');
let inquirer = require("inquirer-async");
let mkdirp = require('mkdirp');
let npm = require("npm");
let denodeify = require('denodeify');
let exec = require('child-process-promise').exec;

// denodeify
let writeFile = denodeify(fs.writeFile);
let mkDir = denodeify(mkdirp);

let prompt = inquirer.promptAsync;

let settings = require('../utils/settings');
let session = require('../utils/session');
let genUniqueName = require('../utils/unique-instance');
let templates = require('../templates');
let helpers = require('./helpers');



function createFilesAndFolders() {
  var question = {
    type: "input",
    name: "srcFolder",
    message: "Where you are keeping your sources?",
    default: function() {
      return "./src";
    },
    validate: function(value) {
      return true;
    }
  };

  return prompt(question)
    .then((answers) => {
      debug(`srcFolder ${answers.srcFolder}`);
      let srcFolder = answers.srcFolder;
      let syncanoFolder = 'syncano';
      if (srcFolder) {
        process.stdout.write('Setting up Syncano... ');
        return mkDir(syncanoFolder)
          .catch((err) => {
            debug(err);
            console.log(format.red('Fail'))
          })
          .then(() => {

            settings.project.set('srcFolder', srcFolder).save();

            let classesDir = path.join(syncanoFolder, 'classes');
            let settingsDir = path.join(syncanoFolder, 'settings');
            let codeboxesDir = path.join(syncanoFolder, 'codebox');

            mkdirp.sync(classesDir);
            mkdirp.sync(codeboxesDir);
            mkdirp.sync(settingsDir);

            Object.keys(templates).forEach((templ) => {
              let t = templates[templ]();
              writeFile(path.join(syncanoFolder, t.path), t.data);
            });

            console.log(format.green('Done'))
          });
      }
    });
}

function generateAPIKey() {

  process.stdout.write('Generating API key for you project... ');

  return session.connection.instance(settings.project.get('name')).apikey().add({
    description: "API key created by Syncano-CLI",
    ignore_acl: true,
    allow_user_create: true
  }).then((resp) => {
    settings.project.set('api_key', resp.api_key).save();
    console.log(format.green('Done'));
  }).catch((err) => {
      console.log(format.red('Error'));
      console.log();
      debug(err);
    }
  );
}

function createInstance() {
  process.stdout.write('Creating Syncano Instance...');

  return session.connection.instance().add({name: genUniqueName()})
    .then((resp) => {
      settings.project.set('name', resp.name);
      settings.project.set('metadata', resp.metadata);
      settings.project.set('owner', resp.owner);
      settings.project.save();

      console.log(format.green('Done'));
    });
}

function getInstance(instanceName) {
  process.stdout.write('Getting Syncano Instance...');

  return session.connection.instance().detail(instanceName)
    .then((resp) => {
      settings.project.set('name', resp.name);
      settings.project.set('metadata', resp.metadata);
      settings.project.set('owner', resp.owner);
      settings.project.save();

      console.log(format.green('Done'));
    });
}

module.exports = function(options) {

  settings.project.load();

  if (settings.project.get('name')) {
    console.log('Project already initiated!');
    console.log('Remove .syncano folder to start over.\n');
    process.exit()
  }

  createFilesAndFolders()
    .then((resp) => {
      if (!options.instance) {
        return createInstance();
      } else {
        return getInstance(options.instance);
      }
    })
    .then(() => {
      return generateAPIKey();
    })
    .then(() => {
      return helpers.buildModules();
    })
    .then(() => {
      return helpers.buildWithWebpack();
    })
    .catch((resp) => {
      if (resp.compilation) {
        console.log(resp.compilation.errors)
      }
      console.log(format.red('Fail'));
      debug(resp);
    });

};