#!/usr/bin/env node
var bower = require("bower");
var async = require('async');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var bower_conf;
var test;
var debug = false;

function _mkdir(path, cb){
  if (! path) return cb();
  child_process.exec('mkdir -pv '+path, function(err, stdout, stderr){
    if (err){
      console.log('ERROR: Unable to create directory '+path);
      return process.exit(1);
    }
    if (debug) console.log('mkdir stdout: '+ stdout)
    if (debug) console.log('mkdir stderr: '+ stderr)
    cb();
  })
}

function _clear_target(path, cb){
  fs.unlink(path, function(err){
    if (err){ 
      if (debug) console.log('can\'t unlink');
      return cb();
    }
    var retries = 3;
    var delay = 500;
    (function stat_sync(){
      if (debug) console.log('in the test block');
       fs.stat(path, function(err, stats){
         if (err) return;
         retries--;
         if (retries) return setTimeout(stat_sync, delay);
         console.log('ERROR: Could not unlink '+path);
         process.exit(1);
       })
    })()
    return cb();
  })
}

function _make_link(file, subdir, cb){
  _mkdir(subdir, function(){
    var target = path.join(subdir, file.name);
    if(debug) console.log('Creating link...', file.path, target);
    _clear_target(target, function() { 
      fs.symlink(file.path, target, cb) ;
    });
  });
}


module.exports = test = function(destination, final_callback){
  destination = destination || './'
  async.waterfall([
    function run_bower(run_bower_cb){ 
      bower.commands.list().on("end", function(results){
        if (! results){
          console.log('Recieved no info from bower. Maybe nothing installed.');
          process.exit(1);
        }
        run_bower_cb(null, results);  
        
      });
    },
    function parse(results, parse_cb){
      bower_conf = results;
      var files_to_link = [];
      var path;
      if (! Object.keys(bower_conf.dependencies).length | typeof(bower_conf.dependencies === 'undefined')){
        console.log('ERROR: Cannot link bower code, no dependencies installed.');
        process.exit(1);
      }
      Object.keys(bower_conf.dependencies).forEach(function(key){
        var target = (bower_conf.dependencies[key]['pkgMeta']['main']).toString().split(','); //cast as array
        target.forEach(function(path){
           files_to_link.push( {
             name : path.replace(/.*\//,''), 
             path : bower_conf.dependencies[key]['canonicalDir'] + '/' + path,
           });
        });
      });
      parse_cb(null, files_to_link);
    },
    function link_files(files_to_link, link_files_cb){
      if (debug) console.log('linking files...');
      async.each(files_to_link, function(file, each_callback) {
        if (/(?:(?:\/js\/))|(?:\.js)/gi.exec(file.path)){
           _make_link(file, path.join(destination, 'js'), each_callback);
        }else if(/(?:(?:\/css\/))|(?:\.css)/gi.exec(file.path)){
           _make_link(file, path.join(destination, 'css'), each_callback);
        }else if(/(?:(?:\/fonts?\/))|(?:\.(?:wof)|(?:svg)|(?:eot)|(?:ttf)$)/ig.exec(file.path)){
           _make_link(file, path.join(destination, 'fonts'), each_callback);
        }else if(/\.less$/i.exec(file.path)){
           _make_link(file, path.join(destination, 'less'), each_callback);
        }else{
           _make_link(file, path.join(destination, ''), each_callback);
        }
      }, function(err){
          if( err ) {
            console.log(err);
            if (err.code === 'ENOENT'){
              console.log('ERROR: Cannot make symlinks.'); 
            }else{
              console.log('ERROR:'+JSON.stringify(err));
            }
            return process.exit(1);
          } else {
            if (debug) console.log('All files have been processed successfully');
            return link_files_cb(null);
          }
      });
    },
  ],
    function(err, end){
      if (err){
        console.log("ERROR: Couldn't Link Bower");
        console.log("ERROR: "+err.toString());
        process.exit(1);
      }

      final_callback();
    }
  );

}
