var generators = require('yeoman-generator');
var path = require('path');
var _ = require('underscore');
var _s = require('underscore.string');
var child_process = require('child_process');
var async = require('async');
var play_ascii = require('./play_ascii');
var custom_template = require('./custom_template');
var custom_npmInstall = require('./custom_npmInstall');
var custom_bowerInstall = require('./custom_bowerInstall');
var bower_linker = require('./bower_linker.js');
var assets_sorter = require('./assets_sorter.js');

var fs = require('fs');


module.exports = generators.Base.extend({
  // The name `constructor` is important here
  constructor: function () {
    // this is called at initialization, that's why you have generators.Base.apply
    //event listeners go here
    generators.Base.apply(this, arguments);
    
    this._source = this.sourceRoot();
    this._destination = this.destinationRoot();
    //I had to over-write the template function to be async...
    this.template = custom_template(this._source, this._destination);
    //npm install and bower install did not work async as either. What gives!
    this.npmInstall = custom_npmInstall
    this.bowerInstall = custom_bowerInstall

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
     var that = this;
     //
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
       if (typeof props.site_name === 'undefined' || ! props.site_name ){
         props.site_name = 'No Name';
       }
       _.extend(this.options, props);
       
       async.waterfall([
         function pj_tpl(pj_tpl_callback){
           that.template('_package.json', 'package.json', that, function() { pj_tpl_callback(null) } );
         },
         function bower_tpl(bower_tpl_callback){
           that.template('_bower.json', 'bower.json', that, function() { bower_tpl_callback(null) } );
         },
         function gitignore_tpl(gitignore_tpl_callback){
           that.template('_gitignore', '.gitignore', that, function() { gitignore_tpl_callback(null) } );
         },
       ], function (err, result) {
          if (err) throw 'unable to make templates';
          done();
       }); 
     }.bind(this));
  },
  promptJS: function() {
     var done = this.async();
     var that = this;
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
       this.bowerInstall(props.features, function(){ console.log(""), done() });
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
             name: 'bootstrap-css',
             value: 'bootstrap-css',
             checked: false
           },
           {
             name: 'jquery-ui',
             value: 'jqueryui',
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
       this.bowerInstall(props.features, done);
     }.bind(this));
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
         child_process.exec('mkdir -p views/layouts', function(error, stdout, stderr){
           if(error){
             console.log("ERROR: error building dancer");
             console.log("ERROR: "+error.toString());
           }
           console.log(stdout);
           console.log(stderr);
           mkdir_templates_callback(null);
         });
       },
       function mkdir_css(mkdir_css_callback){
         child_process.exec('mkdir -p static/css', function(error, stdout, stderr){
           if(error){
             console.log("ERROR: error building dancer");
             console.log("ERROR: "+error.toString());
           }
           console.log(stdout);
           console.log(stderr);
           mkdir_css_callback(null);
         });
       },
       function mkdir_js(mkdir_js_callback){
         child_process.exec('mkdir -p static/js', function(error, stdout, stderr){
           if(error){
             console.log("ERROR: error building dancer");
             console.log("ERROR: "+error.toString());
           }
           console.log(stdout);
           console.log(stderr);
           mkdir_js_callback(null);
         });
       },
       function add_templates(add_templates_callback){
         var templateSettings = {
              'evaluate'    : /\{\{(.+?)\}\}/g,
              'interpolate'    : /\{\{=(.+?)\}\}/g,
              'escape'    : /\{\{-(.+?)\}\}/g,
          };
         
         async.waterfall([
           function main_tpl(main_tpl_callback){
             that.template('dancer/views/layouts/main.tt', 'views/layouts/main.tt', that, templateSettings, function(){ main_tpl_callback(null) } ); 
           },
           function index_tpl(index_tpl_callback){
             that.template('dancer/views/index.tt', 'views/index.tt', that, templateSettings, function(){ index_tpl_callback(null) } ); 
           },
           function mainjs_tpl(mainjs_tpl_callback){
             that.template('_main.js', 'static/js/main.js', that, templateSettings, function(){ mainjs_tpl_callback(null) } ); 
           },
           function stylecss_tpl(stylecss_tpl_callback){
             that.template('_style.css', 'static/css/style.css', that, templateSettings, function(){ stylecss_tpl_callback(null) } ); 
           },
           function err404_tpl(err404_tpl_callback){
             that.template('dancer/static/404.html', 'static/404.html', that, templateSettings, function(){ err404_tpl_callback(null) } ); 
           },
           function err500_tpl(err500_tpl_callback){
             that.template('dancer/static/500.html', 'static/500.html', that, templateSettings, function(){ err500_tpl_callback(null) } ); 
           },
         ], function (err, result) {
            if (err) throw 'unable to make templates';
            add_templates_callback(null);
         }); 
       },
     ], function (error, result) {
        if(error){
          console.log("ERROR: error building dancer");
          console.log("ERROR: "+error.toString());
          process.exit();
        }
        done();
     }) 
  }, 
  linkBower: function(){
    var done = this.async();
    var that = this;
    console.log('linking bower...');
    bower_linker(path.join(this.destinationRoot(), 'static', 'vendor'), function(links){ that.installed_links = links; console.log(' linked successfully' ), done()} );
  },
  runNPM: function(){
     var done = this.async();
     var that = this;
     var templateSettings = {
          'evaluate'    : /\{\{(.+?)\}\}/g,
          'interpolate'    : /\{\{=(.+?)\}\}/g,
          'escape'    : /\{\{-(.+?)\}\}/g,
     };
     var npmLibs = [
       'grunt', 
       'grunt-contrib-watch',
       'grunt-contrib-concat',
       'grunt-contrib-uglify',
       'grunt-contrib-jshint',
       'grunt-contrib-cssmin',
//      'grunt-contrib-clean',
       'grunt-dancer', 
     ]
     var grunt_ctx = {
       js : JSON.stringify(assets_sorter.js(this.installed_links.js))
     };
     async.waterfall([
       function gruntfile_tpl(gruntfile_tpl_callback){
         that.template('_Gruntfile.js', 'Gruntfile.js', grunt_ctx, templateSettings, function(){ gruntfile_tpl_callback(null) } ); 
       },
       function npmInstall(npmInstall_callback){
         that.npmInstall(npmLibs, function(){ npmInstall_callback(null); });
       }
     ], 
     function(err){
       if (err){
         console.log('ERROR: Error building Gruntfile');
         console.log('ERROR: '+err.toString());
         process.exit(1);
       }
       done();
       return;
     })
  },
  check: function () {
    console.log(this.options);
    console.log("Installation Finished:")
    console.log("Try Running grunt to start the dancer development server, etc");
  },
});
