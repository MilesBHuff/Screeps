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
                branch: 'uglified',
                ptr: false
            }
        }
    });
}
