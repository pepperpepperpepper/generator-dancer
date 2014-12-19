'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
      src: [
        'Gruntfile.js',
        '/static/js/**/*.js',
      ],
      filter: function(filepath){
        return !(filepath.match(/vendor/));
      },
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    // Configuration to be run (and then tested).
    dancer: {
      options: {
        app_path : 'bin/app.pl',
        debug : true,
        args : []
      },
    },
    concat: {
      js: {
        src: ['static/vendor/**/*.js'],
        dest: 'static/js/vendor.js',
      },
      css: {
        src: ['static/vendor/**/*.css'],
        dest: 'static/css/vendor.css',
      },
    },
    uglify: {
      options: {
        mangle: false
      },
      vendor : {
        files: {
          'static/js/vendor.min.js' : [ 'static/js/vendor.js' ]
        }
      },
    },
    cssmin : {
      options: {
      },
      vendor : {
        files: {
          'static/css/vendor.min.css' : [ 'static/css/vendor.css' ]
        }
      }
    }, 
    watch: {
      dancer: {
        options: {
          spawn : false,
        },
        files: [
          'bin/app.pl',
          'templates/**/*.tt',
        ],
        tasks: ['dancer']
      },
      js :{
        options: {
          livereload : true, 
        },
        files: [
          '/static/js/**/*.js',
        ],
        filter: function(filepath){
          return !(filepath.match(/vendor/));
        },
      },
      html : {
        options: {
          livereload : true, 
        },
        files: [
          '/static/**/*.html',
          'templates/**/*.tt',
        ],
        filter: function(filepath){
          return !(filepath.match(/vendor/));
        },
      },
      css : {
        options: {
          livereload : true, 
        },
        files: [
          '/static/css/**/*.css',
        ],
        filter: function(filepath){
          return !(filepath.match(/vendor/));
        },
      },
      vendor : {
        options: {
          livereload : true, 
        },
        files: [
          '/static/vendor/**/*.css', '/static/vendor/**/*.js'
        ],
        tasks: ['concat', 'uglify:vendor', 'cssmin:vendor'], 
      }
    },

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-dancer');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['dancer', 'concat', 'uglify:vendor', 'cssmin:vendor', 'watch']);

};

