let session = require('../utils/session');
let settings = require('../utils/settings');
let exec = require('child-process-promise').exec;
let webpack = require('webpack');
let denodeify = require('denodeify');
let webpackWithPromise = denodeify(webpack);

export function createCodeBox(params) {
  let source = params.source || "// Source is empty!";

  return session.instance(settings.project.get('name')).codebox().add({
    label: params.name,
    source: source,
    runtime_name: 'nodejs',
    config: params.config
  })
    .then((resp) => {
      return resp;
    });
}

export function deleteCodeBox(params) {
  return session.instance.codebox(params.id).delete()
    .catch((resp) => {
      console.log(resp);
    });
}

export function updateCodeBox(params) {
  let source = params.source || " ";

  return session.instance.codebox(params.id).update({
    label: params.name,
    source: source,
    runtime_name: 'nodejs',
    config: params.config
  })
    .catch((err) => {
      console.log(err);
    })
}

export function createWebhook(params) {

  return session.instance.webhook().add({
    codebox: params.CodeBoxId,
    description: 'Created by Syncano CLI for file: ' + params.name,
    name: 'webhook_' + params.CodeBoxId
  })
    .then((resp) => {
      return resp;
    });
}

export function deleteWebhook(params) {

  return session.instance.webhook(params.name).delete()
    .then((resp) => {
      return resp;
    });
}

export function createClass(configClassName) {

  let params = {
    'name': configClassName,
    'schema': settings.project.get('classMap')[configClassName]
  };

  return session.instance.class().add(params)
    .then((resp) => {
      return resp;
    })
    .catch((err) => {
      console.log(err);
    });
}

export function deleteClass(configClassName) {

  return session.instance.class(configClassName).delete()
    .then((resp) => {
      return resp;
    })
    .catch((err) => {
      console.log(err);
    });
}

export function updateClass(configClassName) {

  let params = {
    'name': configClassName,
    'schema': settings.project.get('classMap')[configClassName]
  };

  return session.instance.class(configClassName).update(params)
    .then((resp) => {
      return resp;
    })
    .catch((err) => {
      console.log(err);
    });
}


export function saveToMap(params) {

  let cbMap = settings.project.get('cbMap');
  if (!cbMap) {
    settings.project.set('cbMap', {});
    settings.save()
  }

  cbMap = settings.project.get('cbMap');
  cbMap[params.name] = {
    CodeBoxId: params.CodeBoxId,
    WebhookName: params.WebhookName
  };

  settings.project.set('cbMap', cbMap).save();
}

export function deleteFromMap(name) {

  let cbMap = settings.project.get('cbMap');
  if (!cbMap) {
    return
  }

  if (cbMap[name]) {
    delete cbMap[name]
  }

  settings.project.set('cbMap', cbMap).save();
}

export function buildWithWebpack() {
  process.stdout.write('Making package...');

  return webpackWithPromise({
    context: path.join(process.cwd(), "syncano"),
    entry: './index.js',
    output: {
      path: 'src',
      filename: "syncano.js",
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
  })
    .then(() => {
      console.log(format.green('Done'));
    });
}

export function buildModules() {
  process.stdout.write('Building dependencies...');

  return exec('cd syncano && npm install && cd ..')
    .then((resp) => {
      console.log(format.green('Done'));
    })
    .catch((resp) => {
      console.log(format.red('Fail'));
      debug(resp);
    })
}
