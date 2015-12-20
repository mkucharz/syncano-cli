#!/usr/bin/env node
"use strict";

let fs = require('fs');
let envs = require('envs');
let program = require('commander');
let commands = require('./commands');

let settings = require('./utils/settings');
let session = require('./utils/session');

settings.account.load();
session.load();

program
  .version('0.0.1');

program
  .command('signup')
  .description('login to your Syncano account')
  .option("-k, --key [key]", "Use account key to login")
  .action((env, options) => {
    commands.signup();
  });

program
  .command('instances')
  .description('list user instances')
  .action((env, options) => {
    commands.instances();
  });

program
  .command('init')
  .description('init new Syncano project')
  .option("-i, --instance <instance>", "Instance you want to use for your project. If null instance will be created.")
  .action((options) => {
    commands.init(options);
  });

program
  .command('project')
  .description('show project info')
  .action((env, options) => {
    commands.project();
  });

program
  .command('watch')
  .description('watch for changes and apply them automatically to Syncano')
  .action((env, options) => {
    commands.watch();
  });

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse(process.argv);
