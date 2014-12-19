#!/usr/bin/env node
var npm = require('npm');
module.exports = test = function(package_array, callback){ 
  if (typeof package_array === 'string' ){
    package_array = [ package_array ];
  }
  npm.load(function(err, npm){
    if (err) throw "Could not load npm";
    npm.config.set('save-dev', true);
    npm.commands.install(package_array, callback);
  });
}
