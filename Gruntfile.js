module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({
    watch: {
      options: {
        livereload: true
      }
      , site:{
        files: ['app/**']
      }
    }

    , connect: {
      server: {
        options: {
          livereload: true,
          base: 'app/',
          port: 9009
        }
      }
    }

  });

  // Load tasks...
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('serve', [
    'connect:server'
    , 'watch'
    ]);

  // Default task so that you just call 'grunt' on you console
  grunt.registerTask('default', 'serve');
};
