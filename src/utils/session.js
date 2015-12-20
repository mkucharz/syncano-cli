let Syncano = require('syncano');
let settings = require('./settings');

let account = null;

class Session {
  constructor() {
    this.connection = null;
    this.instance = null;
  }

  load() {
    let instance = settings.project.get('name');

    if (settings.account.authenticated()) {
      this.connection = new Syncano({accountKey: settings.account.get('token')});

      if (instance) {
        this.instance = new Syncano({accountKey: settings.account.get('token'), instance: instance});
      }

    } else {
      console.log("No profile found! Sign up first!");
      process.exit()
    }
  }

  instanceLoad() {
    settings.project.load();
    let instanceName = settings.project.get('name');

    if (settings.account.authenticated() && instanceName) {
      let instanceConnection = new Syncano({accountKey: settings.account.get('token')});
      this.instance = instanceConnection.instance(instanceName)
    }
  }
}

module.exports = new Session();