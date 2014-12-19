var generators = require('yeoman-generator');
var path = require('path');
var _ = require('underscore');
var _s = require('underscore.string');
var child_process = require('child_process');
var async = require('async');
var play_ascii = require('./play_ascii');
var bower_linker = require('./bower_linker.js');

var fs = require('fs');

module.exports = generators.Base.extend({
  // The name `constructor` is important here
  constructor: function () {
    // this is called at initialization, that's why you have generators.Base.apply
    //event listeners go here
    generators.Base.apply(this, arguments);

    this.on('end', function () {
      this.spawnCommand('grunt');
    });
    this.options = {};
//    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
     // have Yeoman greet the user
  },
  ascii: function(){ 
    var done = this.async();
    play_ascii(this.sourceRoot() + '/_lib/timtowdi.ascii', done);
  },
  promptSiteConfig: function() {
     var done = this.async();
     //{{{prompt-opts
     var prompts = [
       {
           name: 'site_name',
           message: 'What is your app\'s name ?'
       },
       {
           name: 'site_description',
           message: 'Add a brief Description...'
       },
     ];
     //}}}
     this.prompt(prompts, function (props) {
       console.log(props)
       _.extend(this.options, props);
      this.template('_package.json', 'package.json');
      this.template('_bower.json', 'bower.json');
      this.template('_Gruntfile.js', 'Gruntfile.js');

      done();
     }.bind(this));
  },
  promptJS: function() {
     var done = this.async();
     //{{{ prompt-opts
     var prompts = [
       {
         name: 'features',
         message: 'Which browser-side js libs should be installed?',
         type: 'checkbox',
         choices: [
           {
             name: 'jquery',
             value: 'jquery',
             checked: false
           }, 
           {
             name: 'AMD via Require.js',
             value: 'requirejs',
             checked: false
           },
           {
             name: 'Browserify',
             value: 'browserify',
             checked: false
           },
           {
             name: 'jquery-ui',
             value: 'jqueryui',
             checked: false
           }, 
           {
             name: 'bootstrap',
             value: 'bootstrap',
             checked: false
           },
           {
             name: 'underscore',
             value: 'underscore',
             checked: false
           },
           {
             name: 'lodash',
             value: 'lodash',
             checked: false
           },
           {
             name: 'threejs',
             value: 'threejs',
             checked: false
           }, 
         ]
       }
     ];
     //}}}
     this.prompt(prompts, function (props) {
       this.options.js = {};
       props.features.forEach(function(feature){ 
         this.options.js[feature] = true;
       }.bind(this))
//pb       this.bowerInstall(props.features, { 'saveDev' : true });
       //create symlinks to static/js/vendor here
       done();
     }.bind(this));
  },
  promptCSS: function() {
     var done = this.async();
     //{{{ prompt opts
     var prompts = [
       {
         name: 'features',
         message: 'Which css libs should be installed?',
         type: 'checkbox',
         choices: [
           {
             name: 'unsemantic',
             value: 'unsemantic',
             checked: false
           }, 
           {
             name: 'semantic',
             value: 'semantic',
             checked: false
           },
           {
             name: 'bootstrap',
             value: 'bootstrap',
             checked: false
           },
           {
             name: 'jquery-ui',
             value: 'jqueryui',
             checked: false
           }, 
           {
             name: 'threejs',
             value: 'threejs',
             checked: false
           }, 
         ]
       }
     ];
     //}}}
     this.prompt(prompts, function (props) {
       this.options.css = {};
       props.features.forEach(function(feature){ 
         this.options.css[feature] = true;
       }.bind(this))
//pb       this.bowerInstall(props.features, { 'saveDev' : true });
       //create symlinks to static/js/vendor here
       done();
     }.bind(this));
  },
  buildGruntfile: function(){
     var done = this.async();
     var npmLibs = [
       'grunt', 
       'grunt-contrib-watch',
       'grunt-contrib-concat',
       'grunt-contrib-uglify',
       'grunt-contrib-cssmin',
//      'grunt-contrib-clean',
       'grunt-dancer', 
     ]
//pb     this.npmInstall(npmLibs, { 'saveDev' : true });
     
     this.template('_Gruntfile.js', 'Gruntfile.js');
     done();
  },
  
  buildDancer: function(){
     var done = this.async();
     var that = this;
     async.waterfall([
       function copy_bin(copy_bin_callback){
         child_process.exec(_s.sprintf('cp -frv %s/dancer/bin %s/dancer/config.yml %s', that.sourceRoot(), that.sourceRoot(), that.destinationRoot()), function(error, stdout, stderr){
           if(error){
             console.log("ERROR: error building dancer");
             process.exit(1);
           }
           console.log(stdout);
           console.log(stderr);
           copy_bin_callback(null);
         });
       },
       function mkdir_static(copy_bin_callback){
         child_process.exec('mkdir -p static/vendor', function(error, stdout, stderr){
           if(error){
             console.log("ERROR: error building dancer");
             console.log("ERROR: "+error.toString());
             process.exit(1);
           }
           console.log(stdout);
           console.log(stderr);
           copy_bin_callback(null);
         });
       },
       function mkdir_templates(mkdir_templates_callback){
         child_process.exec('mkdir -p templates/layouts', function(error, stdout, stderr){
           if(error){
             console.log("ERROR: error building dancer");
             console.log("ERROR: "+error.toString());
           }
           console.log(stdout);
           console.log(stderr);
           mkdir_templates_callback(null);
         });
       },
       function add_templates(){
         var templateSettings = {
              'evaluate'    : /\{\{(.+?)\}\}/g,
              'interpolate'    : /\{\{=(.+?)\}\}/g,
              'escape'    : /\{\{-(.+?)\}\}/g,
          };
         console.log('this is that.options')
         that.template('dancer/templates/index.tt', 'templates/layouts/index.tt', that, templateSettings); 
         that.template('dancer/templates/layouts/main.tt', 'templates/layouts/main.tt', that, templateSettings); 
         done();
       },
     ], function (error, result) {
        if(error){
          console.log("ERROR: error building dancer");
          console.log("ERROR: "+error.toString());
          done();
        }
     }) 
  }, 
  linkBower: function(){
    var done = this.async();
    bower_linker(path.join(this.destinationRoot(), 'static', 'vendor'), done);
  },
  check: function () {
    console.log(this.options);
  },
});
