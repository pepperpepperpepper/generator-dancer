#!/usr/bin/env node
var _ = require('underscore');
var path = require('path');
var async = require('async');
var fs = require('fs');

var test;



module.exports = test = function (sourcePath, destinationPath){
  return function (source, destination, context, options, final_callback) {
    source = path.join(sourcePath, source);
    destination = path.join(destinationPath, destination);
    context = context || this; 
    //IMPROVE ME: check args
    if (typeof (final_callback) === 'undefined'){
      final_callback = options;
      if (typeof (options) === 'undefined'){
        console.log('ERROR: No callback specified for template.');
        process.exit(1);
      }
      options = undefined;
    };
    async.waterfall([
        function read(read_callback){
          fs.readFile(source, { encoding: 'utf8' }, function(err, data){
            if (err){
              console.log('ERROR: Could not read '+source);
              process.exit(1);
            }
            read_callback(null, data);
          });
        },
        function process(data, process_callback){
           if (options && options !== {}) _.templateSettings = options
           var compile = _.template(data);
           var newdata = compile(context)
           process_callback(null, newdata);
        },
        function writeFile(filedata, write_file_callback){
          fs.writeFile(destination, filedata, function (err) {
            if (err) throw err;
            console.log('Template File written.');
            console.log(' Source: '+source);
            console.log(' Destination: '+destination);
            write_file_callback(null);
          });
        }
    ], function (err, result) {
       if (err){
         console.log('ERROR: '+JSON.stringify(err));
         process.exit(1);
       }
       return final_callback();
    });
  }
}

//function cb(){
//  console.log('yooooooooooo');
//}
//var custom_template = test('temp_source', 'temp_dest');
//custom_template('source.t', 'dest.t', { bread: 'lala', butter: 'yoyo' }, cb);
