"use strict";

let debug = require('debug')('init');
let fs = require('fs');
let path = require('path');
let format = require('chalk');
let inquirer = require("inquirer-async");
let mkdirp = require('mkdirp');
let npm = require("npm");
let denodeify = require('denodeify');

let genUniqueName = require('../utils/unique-instance');

let exec = require('child-process-promise').exec;

// denodeify
let writeFile = denodeify(fs.writeFile);
let mkDir = denodeify(mkdirp);


let prompt = inquirer.promptAsync;

let settings = require('../utils/settings');
let session = require('../utils/session');

let templates = require('../templates');
let helpers = require('./helpers');


//let classesTempl = `\
//'use strict';
//
//class SyncanoClass {
//  constructor(options) {
//    this.syncano = true;
//  }
//  static isSyncanoClass() {
//    return true
//  }
//  static getClassName() {
//    return this.constructor.name.toLowerCase()
//  }
//  set channel(name) {
//    console.log("XXX", this.constructor.name.toLowerCase(), name)
//  }
//}
//
//
////let SyncanoClass = require('./SyncanoClass');
//
//export class Book extends SyncanoClass {
//  static schema() {
//    return [
//      {"name": "book_title", "type": "string"}
//    ]
//  }
//}
//`;

//function installSyncano() {
//  process.stdout.write('Installing Syncano Library... ');
//  return exec('npm install syncano --save')
//    .then((resp) => {
//      console.log(format.green('Done'));
//    })
//    .catch((resp) => {
//      console.log(format.red('Fail'));
//      debug(resp);
//    })
//}


//function createCBFolder() {
//  var question = {
//    type: "input",
//    name: "codeboxFolder",
//    message: "Where you want to keep your CodeBox",
//    default: function() {
//      return "./src/syncano/codebox";
//    },
//    validate: function(value) {
//      return true;
//    }
//  };
//
//  return prompt(question)
//    .then((answers) => {
//      debug(`createCBFolder ${answers.codeboxFolder}`);
//      if (answers.codeboxFolder) {
//        process.stdout.write('Setting up CodeBox folder... ');
//        return mkDir(answers.codeboxFolder)
//          .catch((err) => {
//            debug(err);
//            console.log(format.red('Fail'))
//          })
//          .then(() => {
//            settings.project.set('CodeBoxFolder', answers.codeboxFolder).save();
//            console.log(format.green('Done'))
//          });
//      }
//    });
//}

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

//function createClassFile(callback) {
//  let question = {
//    type: "input",
//    name: "classFile",
//    message: "Where you want to keep your Class definition file?",
//    default: function() {
//      return "./src/syncano/classes/book.js";
//    },
//    validate: function(value) {
//      return true;
//    }
//  };
//
//  return prompt(question)
//    .then((answers) => {
//
//      if (answers.classFile) {
//        process.stdout.write('Setting up Class definition file... ');
//        let classFile = answers.classFile;
//
//        return mkDir(path.dirname(answers.classFile))
//          .catch(() => {
//            console.log(format.red('Fail'))
//          })
//          .then(() => {
//            if (fs.existsSync(classFile)) {
//              process.stdout.write(format.yellow(`${classFile} already exists! `));
//            } else {
//              return writeFile(classFile, classesTempl)
//            }
//          })
//          .then(() => {
//            settings.project.set('classFile', classFile).save();
//            console.log(format.green('Done'));
//          });
//      }
//    });
//}

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

  //buildWithWebpack()
  //  .then((output) => {
  //    console.log(output.compilation.errors)
  //  })
  //  .catch((resp) => {
  //    console.log(resp)
  //  });

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