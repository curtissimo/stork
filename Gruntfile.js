module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

  , jslint: {
      server: {
        src: ['lib/*.js']
      }
    }

  , nodeunit: {
      all: ['test/*.js']
    }
  });

  // load our plugins
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks("grunt-contrib-nodeunit");

// and define our tasks
// this would be run by typing "grunt test" on the command line
grunt.registerTask('test', ['nodeunit']);

// the default task can be run just by typing "grunt" on the command line
grunt.registerTask('default', ['jslint', 'nodeunit']);
};
