"use strict";

let debug = require('debug')('settings');
let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let homeDir = require('home-dir');

class Settings {

  constructor() {
    this.attributes = {};
    this.filePath = null;
  }

  load() {
    // Create user and config directories
    //let configDir = this.baseDir;
    mkdirp.sync(this.baseDir);

    this.filePath = path.join(this.baseDir, `${this.name}.json`);


    debug(`Loading ${this.name} - ${this.filePath}`);

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
    }

    let config = require(this.filePath);
    this.attributes = config;
    return config;
  }

  exist() {
    return fs.existsSync(this.filePath);
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.attributes, null, 2));
  }

  get(key) {
    return this.attributes[key];
  }

  set(key, value, save) {
    this.attributes[key] = value;
    if (save !== false) this.save();
    return this;
  }
}

class AccountSettings extends Settings {
  constructor() {
    super();
    this.name = 'account';
    this.baseDir = homeDir() + '/.syncano';

  }

  logout() {
    delete this.attributes.token;
    this.save();
  }

  authenticated() {
    return this.attributes.token;
  }
}

class ProjectSettings extends Settings {
  constructor() {
    super();
    this.name = 'instance';
    this.baseDir = process.cwd() + '/syncano/settings';
  }
}

module.exports = {
  project: new ProjectSettings(),
  account: new AccountSettings()
};