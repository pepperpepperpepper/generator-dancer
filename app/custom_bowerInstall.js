#!/usr/bin/env node
var bower = require('bower');
module.exports = test = function(package_array, callback){ 
  if (typeof package_array === 'string' ){
    package_array = [ package_array ];
  }
  bower.commands
    .install(package_array, { save: true, forceLatest: true }, { /* custom config */ })
    .on('end', function (installed) {
      console.log(installed);
    });
}
