'use strict';

exports.connect = function (cli) {
  Object.keys(commands).forEach(function (commandName) {
    commands[commandName](cli);
  });
};