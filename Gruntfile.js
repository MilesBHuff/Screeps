module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            dist: {
                src: ['bin/*.js']
            },
            options: {
                email: '',
                password: '',
                branch: 'minified',
                ptr: false
            }
        }
    });
}
